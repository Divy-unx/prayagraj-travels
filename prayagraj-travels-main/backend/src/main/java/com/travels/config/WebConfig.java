package com.travels.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC configuration.
 *
 * <p>CORS is intentionally configured only in
 * {@link com.travels.security.SecurityConfig#corsConfigurationSource()} so that
 * Spring Security's CORS filter runs <em>before</em> the dispatcher servlet and
 * correctly handles pre-flight OPTIONS requests for protected endpoints.
 * Configuring CORS in both places would cause duplicate headers and conflicts.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // No additional MVC configuration required at this time.
    // CORS is owned by SecurityConfig (allowCredentials=true for httpOnly cookie support).
}
