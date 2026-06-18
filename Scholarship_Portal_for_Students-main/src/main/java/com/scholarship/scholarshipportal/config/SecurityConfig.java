package com.scholarship.scholarshipportal.config;

import com.scholarship.scholarshipportal.security.JwtFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Production-Grade Security Configuration.
 *
 * Security layers (in order of execution):
 * 1. CORS Filter — validates cross-origin requests
 * 2. Security Headers — X-Frame-Options, X-Content-Type-Options, etc.
 * 3. Rate Limit Filter — Redis-backed sliding window counter
 * 4. JWT Filter — validates Bearer token and sets SecurityContext
 * 5. Authorization Rules — endpoint-level access control
 *
 * SECURITY IMPACT:
 * - CORS: Prevents unauthorized domains from calling our API (configurable via env var)
 * - CSRF disabled: Correct for stateless JWT APIs (token in Authorization header prevents CSRF)
 * - Stateless sessions: No server-side session, each request carries its own authentication
 * - Security headers: Prevents clickjacking, XSS, MIME-sniffing attacks
 * - Actuator restricted: Only /health is public, /metrics and /prometheus require auth
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtFilter jwtFilter;
        private final RateLimitFilter rateLimitFilter;

        @Value("${cors.allowed.origins:http://localhost:3000}")
        private String corsAllowedOrigins;

        public SecurityConfig(JwtFilter jwtFilter, RateLimitFilter rateLimitFilter) {
                this.jwtFilter = jwtFilter;
                this.rateLimitFilter = rateLimitFilter;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
                        throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())

                                // ====== Security Headers ======
                                // X-Content-Type-Options: nosniff — prevents MIME-type sniffing attacks
                                // X-Frame-Options: DENY — prevents clickjacking by blocking iframe embedding
                                // X-XSS-Protection: enabled — legacy XSS filter for older browsers
                                // Strict-Transport-Security — forces HTTPS in production
                                .headers(headers -> headers
                                                .contentTypeOptions(contentType -> {})
                                                .frameOptions(frame -> frame.deny())
                                                .xssProtection(xss -> xss
                                                                .headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
                                                .httpStrictTransportSecurity(hsts -> hsts
                                                                .includeSubDomains(true)
                                                                .maxAgeInSeconds(31536000)))

                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth

                                                // 🔓 SWAGGER — public for API documentation
                                                .requestMatchers(
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()

                                                // 🔓 AUTH — public for login/registration
                                                .requestMatchers("/auth/**").permitAll()

                                                // 🔓 ACTUATOR — only health endpoint is public
                                                // /metrics and /prometheus require authentication
                                                .requestMatchers("/actuator/health").permitAll()
                                                .requestMatchers("/actuator/**").hasAuthority("ROLE_ADMIN")

                                                // 🔓 PUBLIC API — anyone can browse scholarships
                                                .requestMatchers(HttpMethod.GET, "/scholarships", "/scholarships/{id}")
                                                .permitAll()

                                                // 🔒 ADMIN — scholarship management
                                                .requestMatchers(HttpMethod.POST, "/scholarships", "/scholarships/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/scholarships", "/scholarships/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/applications/status",
                                                                "/applications/status/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.GET, "/applications/all",
                                                                "/applications/all/**")
                                                .hasAuthority("ROLE_ADMIN")
                                                
                                                // 🔒 ADMIN ANALYTICS
                                                .requestMatchers("/admin/analytics", "/admin/analytics/**")
                                                .hasAuthority("ROLE_ADMIN")

                                                // 🔒 STUDENT — profile management
                                                .requestMatchers("/profile", "/profile/**").hasAuthority("ROLE_STUDENT")
                                                .requestMatchers("/applications/apply", "/applications/apply/**")
                                                .hasAuthority("ROLE_STUDENT")
                                                .requestMatchers("/applications/my").hasAuthority("ROLE_STUDENT")
                                                .requestMatchers("/scholarships/eligible").hasAuthority("ROLE_STUDENT")
                                                
                                                // 🔒 STUDENT — documents
                                                .requestMatchers("/documents/**").hasAuthority("ROLE_STUDENT")
                                                
                                                // 🔒 STUDENT — recommendations & bookmarks
                                                .requestMatchers("/student/recommendations", "/student/recommendations/**")
                                                .hasAuthority("ROLE_STUDENT")
                                                .requestMatchers("/student/bookmarks", "/student/bookmarks/**")
                                                .hasAuthority("ROLE_STUDENT")

                                                // 🔒 COLLEGE — student management
                                                .requestMatchers("/college", "/college/**")
                                                .hasAuthority("ROLE_COLLEGE")

                                                .anyRequest().authenticated())
                                // Rate limiting runs FIRST (before auth) to block brute-force attacks
                                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * CORS Configuration — loaded from environment variable.
         *
         * SECURITY IMPACT:
         * - AllowedOrigins from env var — configurable per environment
         * - AllowedMethods restricted to required HTTP methods
         * - AllowedHeaders include Authorization for JWT tokens
         * - MaxAge set to 3600 (1 hour) to reduce preflight requests
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // Parse comma-separated origins from environment variable
                List<String> origins = Arrays.asList(corsAllowedOrigins.split(","));
                configuration.setAllowedOrigins(origins);
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
                configuration.setExposedHeaders(List.of("X-Total-Count", "X-Page-Size"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                return source;
        }
}