package com.google.rolecall.authentication;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

@Profile("dev")
@Component
public class CustomDebugAuthenticationProvider implements AuthenticationProvider {

  private final UserDetailsService detailService;

  @Override
  public Authentication authenticate(Authentication authentication)
      throws AuthenticationException {
    String email = authentication.getName();

    UserDetails user;
    try {
      user = detailService.loadUserByUsername(email);
    } catch(UsernameNotFoundException ex) {
      throw new BadCredentialsException(String.format(
          "User with email %s could not be authenticated.", email));
    }

    Authentication auth = new RememberMeAuthenticationToken("Bad_HardCoded_Key", user, user.getAuthorities());
    return auth;
  }


  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(PreAuthenticatedAuthenticationToken.class);
  }

  public CustomDebugAuthenticationProvider(UserDetailsService detailService) {
    this.detailService = detailService;
  }
}
