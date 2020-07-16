package com.google.rolecall.restcontrollers;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Patch;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.UserServices;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Endpoint("/api/user")
public class UserManagement extends AsyncRestEndpoint {
  
  private final UserServices userService;

  @Get
  public CompletableFuture<ResponseSchema<List<User>>> getAllUsers() {
    List<User> allUsers = userService.getAllUsers();

    return CompletableFuture.completedFuture(new ResponseSchema<List<User>>(allUsers));
  }

  /* Attempts to get a user by Id and fails when the id is not associated with an object */
  @Get(Constants.RequestParameters.USER_ID)
  public CompletableFuture<ResponseSchema<User>> getSingleUser(
      @RequestParam(value=Constants.RequestParameters.USER_ID, required=true) int id) {
    User user;
    try {
      user = userService.getUser(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    return CompletableFuture.completedFuture(new ResponseSchema<User>(user));
  }

  /* Creates a new user and fails on insufficient or invalid User information. */
  @Post
  public CompletableFuture<Void> createUser(@RequestBody UserInfo user) {
    try {
      userService.createUser(user);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }

    return CompletableFuture.completedFuture(null);
  }

  /* Edits a user and fails on non existing user id. */
  @Patch
  public CompletableFuture<Void> editUser(@RequestBody UserInfo user) {
    if (user.getId() == null) {
      return CompletableFuture.failedFuture(new InvalidParameterException("Missing id"));
    }
    try {
      userService.editUser(user);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    return CompletableFuture.completedFuture(null);
  }

  /* Deletes a user based on id. Does not throw an exception if the user does not exist. */
  @Delete(Constants.RequestParameters.USER_ID)
  public void deleteUser(
      @RequestParam(value=Constants.RequestParameters.USER_ID, required=true) int id) {
        userService.deleteUser(id);
  }

  public UserManagement(UserServices userService) {
    this.userService = userService;
  }
}
