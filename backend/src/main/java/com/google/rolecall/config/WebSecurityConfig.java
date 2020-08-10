package com.google.rolecall.config;

import java.util.Arrays;
import java.util.List;

import com.google.rolecall.authentication.PreAuthTokenHeaderFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/* Security Configuration for authenticating a request to the REST application. */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, proxyTargetClass = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  private final AuthenticationProvider authProvider;
  private final Environment env;

  @Override
  public void configure(AuthenticationManagerBuilder authenticationManagerBuilder)
      throws Exception {
      authenticationManagerBuilder.authenticationProvider(authProvider);
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.httpBasic().and().cors().and()
        .addFilter(getFilter())
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
        .sessionFixation().migrateSession()
        .and().authorizeRequests().antMatchers("/api/**").authenticated()
        .and().logout()
        .deleteCookies("SESSIONID").invalidateHttpSession(true)
        .logoutRequestMatcher(new AntPathRequestMatcher("/logout"));

    List<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
    if(activeProfiles.contains("dev")) {
      http.csrf().disable();
    }
  }

  /** Initializes the filter for Authentication header information. */
  private PreAuthTokenHeaderFilter getFilter() throws Exception {
    PreAuthTokenHeaderFilter filter = new PreAuthTokenHeaderFilter();
    filter.setAuthenticationManager(authenticationManager());
    return filter;
  }

  public WebSecurityConfig(AuthenticationProvider authProvider, Environment env) {
    this.authProvider = authProvider;
    this.env = env;
  }
}
