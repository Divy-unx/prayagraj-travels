package com.travels.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    // Comma-separated list of allowed origins. Set in environment, e.g.:
    //   ALLOWED_ORIGINS=http://localhost:3000,https://prayagraj-travels.vercel.app
    // Defaults to localhost for development
    @Value("${ALLOWED_ORIGINS:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        try {
            // Parse origins and trim whitespace
            String[] origins = allowedOrigins.split(",");
            String[] trimmedOrigins = new String[origins.length];
            
            for (int i = 0; i < origins.length; i++) {
                trimmedOrigins[i] = origins[i].trim();
            }

            log.info("Configuring CORS for origins: {}", String.join(", ", trimmedOrigins));

            // Global CORS configuration for all endpoints
            registry.addMapping("/**")
                    .allowedOrigins(trimmedOrigins)
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                    .allowedHeaders("Content-Type", "Accept", "Authorization", "X-Requested-With")
                    .exposedHeaders("Content-Type", "X-Total-Count")
                    .allowCredentials(false)
                    .maxAge(3600); // Cache preflight requests for 1 hour
            
            log.info("CORS configuration applied successfully");
        } catch (Exception e) {
            log.error("Failed to configure CORS: {}", e.getMessage(), e);
            throw new RuntimeException("CORS configuration failed", e);
        }
    }
}
