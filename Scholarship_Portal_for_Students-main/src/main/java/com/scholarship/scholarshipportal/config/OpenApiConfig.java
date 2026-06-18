package com.scholarship.scholarshipportal.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI (Swagger) Configuration for the Scholarship Portal.
 * 
 * Access the Swagger UI at: http://localhost:8080/swagger-ui.html
 * Access the API docs at: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI scholarshipPortalOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Scholarship Portal API")
                        .description("Production-grade Scholarship Management System with JWT Authentication, "
                                + "Kafka Event-Driven Architecture, Redis Caching, and comprehensive monitoring.\n\n"
                                + "## Authentication\n"
                                + "1. Use `/auth/register` to create an account\n"
                                + "2. Use `/auth/login` to get a JWT token\n"
                                + "3. Click 'Authorize' above and enter: `Bearer <your-token>`\n\n"
                                + "## Roles\n"
                                + "- **STUDENT**: Apply for scholarships, manage profile, view recommendations\n"
                                + "- **ADMIN**: Create scholarships, view analytics, manage applications\n"
                                + "- **COLLEGE**: Manage students, bulk operations, notifications")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("Scholarship Portal Team")
                                .email("support@scholarshipportal.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .externalDocs(new ExternalDocumentation()
                        .description("GitHub Repository")
                        .url("https://github.com/scholarship-portal"))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development"),
                        new Server().url("https://api.scholarshipportal.com").description("Production")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                                .description("Enter your JWT token obtained from /auth/login")));
    }
}