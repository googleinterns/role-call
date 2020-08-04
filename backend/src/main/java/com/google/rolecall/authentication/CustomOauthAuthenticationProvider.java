package com.google.rolecall.authentication;

import com.google.rolecall.services.GoogleAuthServices;

import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.RememberMeAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

@Profile("prod")
@Component
public class CustomOauthAuthenticationProvider implements AuthenticationProvider {

  private final UserDetailsService detailService;
  private final GoogleAuthServices authService;


  @Override
  public Authentication authenticate(Authentication authentication)
      throws AuthenticationException {
    String email = authentication.getName();
    String oauthToken = authentication.getCredentials().toString();

    UserDetails user;
    try {
      user = detailService.loadUserByUsername(email);
    } catch(UsernameNotFoundException ex) {
      throw new BadCredentialsException(String.format(
          "User with email %s could not be authenticated.", email));
    }

    try {
      if(!authService.isValidAccessToken(email, oauthToken)) {
        throw new BadCredentialsException("Email and token do not validate with Google.");
      }
    } catch(Exception ex) {
      throw new AuthenticationServiceException("Unable to successfully authenticate", ex);
    }

    Authentication auth = new RememberMeAuthenticationToken("Bad_HardCoded_Key", user, user.getAuthorities());
    return auth;
  }


  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(PreAuthenticatedAuthenticationToken.class);
  }

  public CustomOauthAuthenticationProvider(UserDetailsService detailService,
      GoogleAuthServices authService) {
    this.detailService = detailService;
    this.authService = authService;
  }
}
