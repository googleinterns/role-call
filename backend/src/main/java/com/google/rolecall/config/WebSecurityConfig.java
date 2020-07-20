package com.google.rolecall.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

/* Security Configuration for authenticating a request to the REST application. */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, proxyTargetClass = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private final Environment env;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    if(env.getProperty("rolecall.debug").equals("true")) {
      http.authorizeRequests()
          .anyRequest().authenticated()
          .and()
          .oauth2Login();
    } else {
      http.csrf().disable();
    } 
  }

  // @Bean
  // public ClientRegistrationRepository clientRegistrationRepository() {
  //     return new InMemoryClientRegistrationRepository((this.googleClientRegistration());
  // }

  // private ClientRegistration googleClientRegistration() {
  //   return ClientRegistration.withRegistrationId("google")
  //       .clientId("google-client-id")
  //       .clientSecret("google-client-secret")
  //       .clientAuthenticationMethod(ClientAuthenticationMethod.BASIC)
  //       .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
  //       .redirectUriTemplate("{baseUrl}/login/oauth2/code/{registrationId}")
  //       .scope("openid", "email")
  //       .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
  //       .tokenUri("https://www.googleapis.com/oauth2/v4/token")
  //       .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
  //       .userNameAttributeName(IdTokenClaimNames.SUB)
  //       .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
  //       .clientName("Google")
  //       .build();
  //   }

  public WebSecurityConfig(Environment env) {
    this.env = env;
  }
}
