package com.google.rolecall.restcontrollers;

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
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Endpoint("/api/user")
public class UserManagement extends AsyncRestEndpoint {
  
  private final UserServices userService;

  @Get
  public CompletableFuture<ResponseSchema<List<User>>> getAllUsers() {
    List<User> allUsers = userService.getAllUsers();

    ResponseSchema<List<User>> response = new ResponseSchema<>(allUsers);
    return CompletableFuture.completedFuture(response);
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
    
    ResponseSchema<User> response = new ResponseSchema<>(user);
    return CompletableFuture.completedFuture(response);
  }

  /* Creates a new user and fails on insufficient or invalid User information. */
  @Post
  public CompletableFuture<ResponseSchema<User>> createUser(@RequestBody UserInfo user) {
    User newUser;
    try {
      newUser = userService.createUser(user);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }
    ResponseSchema<User> response = new ResponseSchema<>(newUser);
    return CompletableFuture.completedFuture(response);
  }

  /* Edits a user and fails on non existing user id. */
  @Patch
  public CompletableFuture<ResponseSchema<User>> editUser(@RequestBody UserInfo user) {
    if (user.id() == null) {
      return CompletableFuture.failedFuture(new InvalidParameterException("Missing id"));
    }
    User newUser;
    try {
      newUser = userService.editUser(user);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<User> response = new ResponseSchema<>(newUser);
    return CompletableFuture.completedFuture(response);
  }

  /* Deletes a user based on id.*/
  @Delete(Constants.RequestParameters.USER_ID)
  public CompletableFuture<Void> deleteUser(
      @RequestParam(value=Constants.RequestParameters.USER_ID, required=true) int id) {
    try {
      userService.deleteUser(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }
    return CompletableFuture.completedFuture(null);
  }

  public UserManagement(UserServices userService) {
    this.userService = userService;
  }
}
