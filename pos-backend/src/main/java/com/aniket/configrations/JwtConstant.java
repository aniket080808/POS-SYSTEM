package com.aniket.configrations;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

public class JwtConstant {

    public static final String SECRET_KEY = resolveSecretKey();
    public static final String JWT_HEADER = "Authorization";

    public static String resolveSecretKey() {
        String envSecret = System.getenv("JWT_SECRET");
        if (envSecret != null && !envSecret.trim().isEmpty()) {
            return envSecret.trim();
        }
        String propSecret = System.getProperty("JWT_SECRET");
        if (propSecret != null && !propSecret.trim().isEmpty()) {
            return propSecret.trim();
        }
        String appSecret = System.getenv("APP_JWT_SECRET");
        if (appSecret != null && !appSecret.trim().isEmpty()) {
            return appSecret.trim();
        }

        // Check local .env file
        try {
            File envFile = new File(".env");
            if (!envFile.exists()) {
                envFile = new File("pos-backend/.env");
            }
            if (envFile.exists()) {
                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.startsWith("JWT_SECRET=")) {
                        String secret = line.substring("JWT_SECRET=".length()).trim();
                        if (!secret.isEmpty()) {
                            return secret;
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        throw new IllegalStateException(
            "CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing. " +
            "Application startup failed. Please set JWT_SECRET in your .env or environment."
        );
    }
}