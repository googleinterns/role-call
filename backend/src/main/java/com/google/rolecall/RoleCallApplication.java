package com.google.rolecall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/* Initializes the REST Application. */
@SpringBootApplication
@EnableWebMvc
public class RoleCallApplication {

  public static void main(String[] args) {
    SpringApplication.run(RoleCallApplication.class, args);
  }

  @Bean
  public RestTemplate getRestTemplate() {
     return new RestTemplate();
  }
}
