package com.google.rolecall.config;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import com.google.rolecall.authentication.PreAuthTokenHeaderFilter;


public class CustomDsl extends AbstractHttpConfigurer<CustomDsl, HttpSecurity> {
  final AuthenticationProvider authProvider;

  @Override
  public void configure(HttpSecurity http) throws Exception {
    AuthenticationManagerBuilder authenticationManagerBuilder =
        http.getSharedObject(AuthenticationManagerBuilder.class);
    authenticationManagerBuilder.authenticationProvider(authProvider);
    AuthenticationManager authenticationManager =
        http.getSharedObject(AuthenticationManager.class);
    http.addFilter(createPreAuthenticationFilter(authenticationManager));
  }

  private PreAuthTokenHeaderFilter createPreAuthenticationFilter(
    AuthenticationManager authenticationManager
  ) throws Exception {
    PreAuthTokenHeaderFilter filter = new PreAuthTokenHeaderFilter();
    filter.setAuthenticationManager(authenticationManager);
    return filter;
  }

  public static CustomDsl customDsl(AuthenticationProvider authProvider) {
    return new CustomDsl(authProvider);
  }

  CustomDsl(
    AuthenticationProvider authProvider
  ) {
    this.authProvider = authProvider;
  }

}