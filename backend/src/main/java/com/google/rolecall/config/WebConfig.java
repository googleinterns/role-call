package com.google.rolecall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Profile("dev")
@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final Environment env;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
      String allowedOrigin = env.getProperty("rolecall.frontend.url");
      
      registry.addMapping("/api/**").allowedOrigins(allowedOrigin)
          .allowedMethods("GET", "POST", "PATCH", "DELETE");
      registry.addMapping("/logout").allowedOrigins(allowedOrigin)
          .allowedMethods("GET", "POST", "PATCH", "DELETE");
  }

  public WebConfig(Environment env) {
    this.env = env;
  }
}
