package com.google.rolecall.authentication;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

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

  private Logger logger = Logger.getLogger(CustomOauthAuthenticationProvider.class.getName());

  /**
   * Authenticates a user through existence in the database and a valid Google Oauth Id Token.
   * 
   * @param authentication current authentication of a user
   * @return Returns the user's authentication as a {@link RememberAuthenticationToken} token 
   * @throws AuthenticationException when bad credentials are provided or is unable to authenticate
   */
  @Override
  public Authentication authenticate(Authentication authentication)
      throws AuthenticationException {
    String email = authentication.getName();
    String oauthToken = authentication.getCredentials().toString();

    logger.log(Level.INFO, String.format("Attempting to login %s", email));

    UserDetails user;
    try {
      user = detailService.loadUserByUsername(email);
    } catch(UsernameNotFoundException ex) {
      throw new BadCredentialsException(String.format(
          "User with email %s could not be authenticated.", email));
    }

    boolean isValid = false;

    try {
      isValid = authService.isValidAccessToken(email, oauthToken);
    } catch(IOException ex) {
      logger.log(Level.SEVERE, "Unable to validate token with Google.", ex);
      throw new AuthenticationServiceException("Unable to successfully authenticate", ex);
    } catch(Exception ex) {
      logger.log(Level.WARNING, "Unexcepted Exception was thrown.", ex);
      throw new AuthenticationServiceException("Unable to successfully authenticate", ex);
    }

    if(!isValid) {
      logger.log(Level.INFO, String.format("Login failed for %s. Invalid Credentials", email));
      throw new BadCredentialsException("Email and token do not validate with Google.");
    }

    logger.log(Level.INFO, String.format("Login for %s was successful", email));

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
    logger.log(Level.INFO, "Using oauth authentication");
  }
}
