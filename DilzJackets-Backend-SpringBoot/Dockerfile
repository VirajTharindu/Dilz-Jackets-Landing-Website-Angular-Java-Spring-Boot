# ==============================================================================
# Multi-stage Dockerfile for Spring Boot (Java 17)
# Optimized for Docker Hub & Render Free Tier
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Application
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Lightweight Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR from builder stage
COPY --from=builder /app/target/app.jar app.jar

# Render dynamically assigns a PORT environment variable at runtime
ENV PORT=8080
EXPOSE 8080

# Production JVM flags:
# - XX:+UseContainerSupport: respects container cgroup CPU & memory limits
# - XX:MaxRAMPercentage=75.0: prevents JVM exceeding Render's 512MB RAM (avoids OOM kills)
# - Djava.security.egd: speeds up cryptographic randomness startup
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
