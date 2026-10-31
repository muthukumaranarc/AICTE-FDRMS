# ==============================================================================
# AICTE-FDRMS: Multi-Stage Production Dockerfile for Spring Boot
# Optimized for Cloud Deployment (Render, Koyeb, Railway, AWS ECS)
# Java 25 LTS Runtime with 512MB Free Tier Memory Tuning
# ==============================================================================

# Stage 1: Build JAR using Maven
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /build

# Copy Maven wrapper & project definition for layer caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package application
COPY src src
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Run as non-privileged service user
RUN addgroup -S fdrmsgroup && adduser -S fdrmsuser -G fdrmsgroup

COPY --from=builder /build/target/AICTE-FDRMS-*.jar app.jar

RUN chown -R fdrmsuser:fdrmsgroup /app
USER fdrmsuser

# Render dynamically sets $PORT (e.g. 10000); default to 8080 locally
ENV PORT=8080
EXPOSE 8080

# Java Heap memory configured for Render 512MB RAM free instances
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar"]
