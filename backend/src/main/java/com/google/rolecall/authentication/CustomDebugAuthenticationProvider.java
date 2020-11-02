package com.google.rolecall.authentication;

import java.util.logging.Level;
import java.util.logging.Logger;
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

@Profile({"dev"})
@Component
public class CustomDebugAuthenticationProvider implements AuthenticationProvider {

  private final UserDetailsService detailService;

  private Logger logger = Logger.getLogger(CustomDebugAuthenticationProvider.class.getName());

  /**
   * Verifies the email of the user is in the database.
   *
   * @param authentication Contains the session's current authentication levels and at least the
   *     email of the user.
   * @return The authentication based on the email of the user as a {@link RememberMeToken} token.
   * @throws AuthenticationException When the email is not in the database.
   */
  @Override
  public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    String email = authentication.getName();

    UserDetails user;
    try {
      user = detailService.loadUserByUsername(email);
    } catch (UsernameNotFoundException ex) {
      throw new BadCredentialsException(
          String.format("User with email %s could not be authenticated.", email));
    }

    Authentication auth =
        new RememberMeAuthenticationToken("Bad_HardCoded_Key", user, user.getAuthorities());
    return auth;
  }

  @Override
  public boolean supports(Class<?> authentication) {
    return authentication.equals(PreAuthenticatedAuthenticationToken.class);
  }

  public CustomDebugAuthenticationProvider(UserDetailsService detailService) {
    this.detailService = detailService;
    logger.log(Level.INFO, "Using debug authentication");
  }
}
