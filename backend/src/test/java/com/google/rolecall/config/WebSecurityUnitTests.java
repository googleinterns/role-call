package com.google.rolecall.config;

import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.config.annotation.ObjectPostProcessor;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class WebSecurityUnitTests { 

  @Test
  public void runWebSecurityConfigurations_success() throws Exception {
    // Setup
    WebSecurityConfig config = new WebSecurityConfig(new MockEnvironment());
    ObjectPostProcessor<Object> objectPostProcessor = new ObjectPostProcessor<Object>() {
      public <T> T postProcess(T object) {
        throw new IllegalStateException("For testing purposes only");
      }
    };
    AuthenticationManagerBuilder authenticationBuilder = new AuthenticationManagerBuilder(
        objectPostProcessor);
    Map<Class<?>, Object> sharedObjects = new HashMap<>();
    HttpSecurity http = new HttpSecurity(objectPostProcessor, authenticationBuilder,
        sharedObjects);

    // Execute
    config.configure(http);
  }
}
