package com.DilzJackets.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.logging.Logger;

/**
 * Utility to load key-value pairs from a local .env file into Java System properties.
 * This runs before Spring Boot boots up so that ${VAR_NAME} placeholders in
 * application.properties resolve seamlessly.
 */
public class DotenvLoader {

    private static final Logger LOGGER = Logger.getLogger(DotenvLoader.class.getName());
    private static boolean loaded = false;

    public static synchronized void load() {
        if (loaded) {
            return;
        }

        // Look for .env in current directory, backend directory, or parent workspace directory
        File[] candidates = new File[] {
            new File(".env"),
            new File("DilzJackets-Backend-SpringBoot/.env"),
            new File("../.env")
        };

        File envFile = null;
        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                envFile = candidate;
                break;
            }
        }

        if (envFile == null) {
            LOGGER.info("[DotenvLoader] No .env file found. Relying on System environment variables.");
            loaded = true;
            return;
        }

        LOGGER.info("[DotenvLoader] Loading environment variables from: " + envFile.getAbsolutePath());
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int separatorIndex = line.indexOf('=');
                if (separatorIndex > 0) {
                    String key = line.substring(0, separatorIndex).trim();
                    String value = line.substring(separatorIndex + 1).trim();

                    // Remove surrounding single or double quotes
                    if ((value.startsWith("\"") && value.endsWith("\"")) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        if (value.length() >= 2) {
                            value = value.substring(1, value.length() - 1);
                        }
                    }

                    // Only set if not already set by system or OS environment
                    if (System.getProperty(key) == null && System.getenv(key) == null) {
                        System.setProperty(key, value);
                    }
                }
            }
            loaded = true;
        } catch (IOException e) {
            LOGGER.warning("[DotenvLoader] Error reading .env file: " + e.getMessage());
        }
    }
}
