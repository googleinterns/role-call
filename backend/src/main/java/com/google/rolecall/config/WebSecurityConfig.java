package com.google.rolecall.config;

import java.net.http.HttpResponse;

import com.google.rolecall.services.CustomUserDetailService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;

/* Security Configuration for authenticating a request to the REST application. */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, proxyTargetClass = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private final Environment env;

  private final CustomUserDetailService userDetailService;

  @Override
	public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
		authenticationManagerBuilder.userDetailsService(userDetailService);
  }
  
  @Bean
  public AuthTokenFil

	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    if(env.getProperty("rolecall.debug").equals("true")) {
      http.csrf().disable()
          .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
          .and()
          .authorizeRequests().antMatchers("/auth/**").permitAll()
          .anyRequest().authenticated();
    } else {
      http.csrf().disable();
    } 
  }
 

  public WebSecurityConfig(Environment env, CustomUserDetailService userDetailService) {
    this.env = env;
    this.userDetailService = userDetailService;
  }
}
