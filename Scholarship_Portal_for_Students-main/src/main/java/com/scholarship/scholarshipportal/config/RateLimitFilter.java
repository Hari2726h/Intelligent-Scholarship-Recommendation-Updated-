package com.scholarship.scholarshipportal.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.scholarship.scholarshipportal.service.RedisCacheService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/**
 * Rate Limiting Filter using Redis sliding window counters.
 *
 * WHY THIS EXISTS:
 * ----------------
 * Without rate limiting, APIs are vulnerable to:
 * 1. Brute-force login attacks (trying thousands of passwords)
 * 2. Registration spam (creating hundreds of accounts)
 * 3. Application flooding (submitting applications in a loop)
 *
 * This filter runs BEFORE Spring Security's JWT filter, so even unauthenticated
 * requests (login/register) are rate-limited.
 *
 * RATE LIMITS:
 * | Endpoint              | Limit          | Window    |
 * |-----------------------|----------------|-----------|
 * | POST /auth/login      | 5 requests     | 60 sec    |
 * | POST /auth/register   | 3 requests     | 3600 sec  |
 * | POST /applications/** | 10 requests    | 60 sec    |
 *
 * INTERVIEW VALUE:
 * "We implement rate limiting as a servlet filter that runs before authentication.
 * It uses Redis INCR with TTL for a fixed-window counter. The key includes the
 * client IP and endpoint path for granular control. When the limit is exceeded,
 * we return 429 Too Many Requests with a Retry-After header."
 *
 * DESIGN PATTERN: Chain of Responsibility (servlet filter chain)
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);

    private final RedisCacheService redisCacheService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RateLimitFilter(RedisCacheService redisCacheService) {
        this.redisCacheService = redisCacheService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = getClientIp(request);

        // Only rate-limit specific POST endpoints
        if ("POST".equalsIgnoreCase(method)) {
            RateLimitConfig config = getRateLimitConfig(path);
            if (config != null) {
                String rateLimitKey = "ratelimit:" + config.action + ":" + clientIp;

                if (!redisCacheService.isRateLimitAllowed(rateLimitKey,
                        config.maxRequests, config.windowSeconds)) {
                    logger.warn("Rate limited: IP={}, path={}, action={}",
                            clientIp, path, config.action);
                    sendRateLimitResponse(response, config.windowSeconds);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Determine rate limit configuration for the given path.
     * Returns null if the path is not rate-limited.
     */
    private RateLimitConfig getRateLimitConfig(String path) {
        if (path.equals("/auth/login")) {
            return new RateLimitConfig("login", 5, 60); // 5 attempts per minute
        }
        if (path.equals("/auth/register")) {
            return new RateLimitConfig("register", 3, 3600); // 3 per hour
        }
        if (path.startsWith("/applications/apply")) {
            return new RateLimitConfig("apply", 10, 60); // 10 per minute
        }
        return null;
    }

    /**
     * Send 429 Too Many Requests response with Retry-After header.
     */
    private void sendRateLimitResponse(HttpServletResponse response, long retryAfterSeconds)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

        Map<String, Object> body = Map.of(
                "success", false,
                "message", "Too many requests. Please try again later.",
                "retryAfterSeconds", retryAfterSeconds
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    /**
     * Extract client IP, handling reverse proxy headers (X-Forwarded-For).
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Simple configuration record for rate limit rules.
     */
    private record RateLimitConfig(String action, int maxRequests, long windowSeconds) {}
}
