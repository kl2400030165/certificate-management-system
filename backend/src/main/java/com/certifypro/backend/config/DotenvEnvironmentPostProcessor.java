package com.certifypro.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DotenvEnvironmentPostProcessor.class);
    private static final List<Path> DOTENV_PATHS = List.of(
            Path.of(".env"),
            Path.of("backend", ".env"),
            Path.of("..", "backend", ".env")
    );

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> properties = new LinkedHashMap<>();

        for (Path dotenvPath : DOTENV_PATHS) {
            loadDotenvFile(dotenvPath, properties);
        }

        if (!properties.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource("certifyproDotenv", properties));
            log.info("Loaded {} properties from dotenv file(s)", properties.size());
        }
    }

    private void loadDotenvFile(Path dotenvPath, Map<String, Object> properties) {
        if (!Files.isRegularFile(dotenvPath)) {
            return;
        }

        Properties loaded = new Properties();
        try (InputStreamReader reader = new InputStreamReader(Files.newInputStream(dotenvPath), StandardCharsets.UTF_8)) {
            loaded.load(reader);
            for (String name : loaded.stringPropertyNames()) {
                properties.put(name, loaded.getProperty(name));
            }
            log.info("Loaded dotenv file: {}", dotenvPath.toAbsolutePath().normalize());
        } catch (IOException ex) {
            log.warn("Failed to load dotenv file {}: {}", dotenvPath, ex.getMessage());
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}