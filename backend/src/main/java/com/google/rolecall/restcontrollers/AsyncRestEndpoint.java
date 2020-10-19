package com.google.rolecall.restcontrollers;

import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.ForbiddenException;
import com.google.rolecall.util.CustomUserDetail;
import java.security.Principal;
import org.springframework.security.authentication.RememberMeAuthenticationToken;

/* Utility methods for REST api enpoint calls. */
public abstract class AsyncRestEndpoint {

  /**
   * Gets the User from the current principal. The principal is 
   * expected to be a {@link RememberMeAuthenticationToken} from the session.
   * The UserDetails field is excpected to be an instance of {@link CustomUserDetails}.
   * 
   * @return {@link User} user for the principal.
   */
  public User getUser(Principal principal) {
    RememberMeAuthenticationToken token = (RememberMeAuthenticationToken) principal;
    CustomUserDetail userDetail = (CustomUserDetail) token.getPrincipal();
    User user = userDetail.getUser();

    return user;
  }
  
  /**
   * Returns proper exception when the User does not have the required perssions to access
   * an endpoint.
   * 
   * @param requiredPrivileges the privleges expected to use the endpoint.
   * @return {@link ForbiddenException}
   */
  public ForbiddenException insufficientPrivileges(String requiredPrivileges) {
    ForbiddenException failure = new ForbiddenException(
        String.format("Requires Permissions: %s", requiredPrivileges));

    return failure;
  }
}
