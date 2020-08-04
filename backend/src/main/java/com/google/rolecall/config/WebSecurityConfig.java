package com.google.rolecall.config;

import com.google.rolecall.authentication.PreAuthTokenHeaderFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

/* Security Configuration for authenticating a request to the REST application. */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, proxyTargetClass = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private final AuthenticationProvider authProvider;

  @Override
  public void configure(AuthenticationManagerBuilder authenticationManagerBuilder)
      throws Exception {
      authenticationManagerBuilder.authenticationProvider(authProvider);
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.httpBasic().and()
        .addFilter(getFilter())
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
        .sessionFixation().migrateSession()
        .and().authorizeRequests()
        .anyRequest().authenticated()
        .and()
        .logout().deleteCookies("SESSIONID").invalidateHttpSession(true).logoutUrl("/logout");
  }

  private PreAuthTokenHeaderFilter getFilter() throws Exception {
    PreAuthTokenHeaderFilter filter = new PreAuthTokenHeaderFilter();
    filter.setAuthenticationManager(authenticationManager());
    return filter;
  }

  public WebSecurityConfig(AuthenticationProvider authProvider) {
    this.authProvider = authProvider;
  }
}
