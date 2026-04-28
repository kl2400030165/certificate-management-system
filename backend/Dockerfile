# ---- Build Stage ----
# Use official Maven image with Java 21 - no mvnw needed
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom first (for dependency caching)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source and build JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ---- Run Stage ----
# Use slim JRE image to keep container small
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/certifypro-backend-1.0.0.jar app.jar

RUN mkdir -p uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
