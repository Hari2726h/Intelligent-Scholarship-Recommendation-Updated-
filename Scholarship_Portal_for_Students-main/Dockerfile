# ====================================================================
# Multi-stage build for optimized production image
# ====================================================================
# Stage 1: Build the application with Maven
# Stage 2: Run with minimal JRE image (Eclipse Temurin)
# ====================================================================

# ---- Build Stage ----
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first (layer caching for dependencies)
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies (cached layer — only re-runs when pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build application (skip tests for faster build)
RUN ./mvnw clean package -DskipTests -Dspring-boot.run.jvmArguments="-Dapp.local-infra.enabled=false"

# ---- Production Stage ----
FROM eclipse-temurin:21-jre-alpine

# Add curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Create directories and set ownership
RUN mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM tuning for containerized environments
# -XX:+UseContainerSupport: Respect container memory limits
# -XX:MaxRAMPercentage: Use up to 75% of container memory for heap
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dapp.local-infra.enabled=false", \
  "-jar", "app.jar"]
