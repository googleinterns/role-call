package com.google.rolecall.config;

import com.google.rolecall.Constants;
import com.google.rolecall.authentication.CustomResponseAttributesFilter;

import java.util.Arrays;

import javax.servlet.Filter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


/* Security Configuration for authenticating a request to the REST application. */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true, proxyTargetClass = true)
public class WebSecurityConfig /* extends WebSecurityConfigurerAdapter */ {

  private AuthenticationProvider authProvider;
  private Environment env;

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.httpBasic()
        .and().cors()
        .and().apply(CustomDsl.customDsl(authProvider))
        .and()
          .addFilterAfter(getCustomResponseAttributes(), BasicAuthenticationFilter.class)
          .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
          .sessionFixation().migrateSession()
        .and().authorizeRequests().antMatchers("/api/**").authenticated()
        .and().logout()
          .deleteCookies("SESSIONID").invalidateHttpSession(true)
          .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
          .logoutSuccessHandler((new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK)))
          .permitAll()
        .and().csrf().disable()
          .exceptionHandling()
          .authenticationEntryPoint((request, response, e) -> {
            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setHeader(Constants.Headers.WWW_AUTHENTICATE, "Bearer");
            response.getWriter().write("{\"error\": \"Access Denied\",\"status\": 401}");
          });
      return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    String allowedOrigin = env.getProperty("rolecall.frontend.url");

    if (allowedOrigin.equals("http://localhost:4200")) {
      // Allow several urls in dev mode, to allow several version to run
      // simultaneously.
      String allowedOrigin2 = env.getProperty("rolecall.frontend.url2");
      String allowedOrigin3 = env.getProperty("rolecall.frontend.url3");
      configuration.setAllowedOrigins(Arrays.asList(
          allowedOrigin, allowedOrigin2, allowedOrigin3));
    } else {
      configuration.setAllowedOrigins(Arrays.asList(allowedOrigin));
    }

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "DELETE"));
    configuration.setAllowCredentials(true);
    configuration.setAllowedHeaders(Arrays.asList("*"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  private Filter getCustomResponseAttributes() throws Exception {
    Filter filter = new CustomResponseAttributesFilter();
    return filter;
  }

  public WebSecurityConfig(
    AuthenticationProvider authProvider,
    Environment env
  ) {
    this.authProvider = authProvider;
    this.env = env;
  }
}


