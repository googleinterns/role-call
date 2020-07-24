package com.google.rolecall;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/* Initializes the REST Application. */
@SpringBootApplication
@EnableWebMvc
public class RoleCallApplication {

  public static void main(String[] args) {
    SpringApplication.run(RoleCallApplication.class, args);
  }
}
