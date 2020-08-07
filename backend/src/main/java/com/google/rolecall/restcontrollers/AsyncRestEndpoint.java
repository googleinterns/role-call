package com.google.rolecall.restcontrollers;

import java.security.Principal;

import com.google.rolecall.models.User;
import com.google.rolecall.util.CustomUserDetail;

import org.springframework.security.authentication.RememberMeAuthenticationToken;

/* Utility methods for REST api enpoint calls. */
public abstract class AsyncRestEndpoint {

  public User getUser(Principal principal) {
    RememberMeAuthenticationToken token = (RememberMeAuthenticationToken) principal;
    CustomUserDetail userDetail = (CustomUserDetail) token.getPrincipal();
    User user = userDetail.getUser();

    return user;
  }
}
