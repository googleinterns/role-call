package com.google.rolecall.restcontrollers;

import java.security.Principal;
import java.util.concurrent.CompletableFuture;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;

/** Endpoints for actons related to Current User. */
@Endpoint(Constants.Mappings.CURRENT_USER)
public class CurrentUser extends AsyncRestEndpoint {

  /**
   * Gets the current User from the session.
   * 
   * @return {@link UserInfo} objects.
   */
  @Get
  public CompletableFuture<ResponseSchema<UserInfo>> getCurrentUser(Principal principal) {
    User currentUser = getUser(principal);

    ResponseSchema<UserInfo> response = new ResponseSchema<>(currentUser.toUserInfo());
    return CompletableFuture.completedFuture(response);
  }
}
