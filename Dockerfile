# Root Dockerfile for Render services configured as Docker.
# The backend source lives in ./backend.

FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/certifypro-backend-1.0.0.jar app.jar
RUN mkdir -p uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
