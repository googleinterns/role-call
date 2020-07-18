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

  /**
   * Gets all {@link User} objects stored in the database.
   * 
   * @return List of {@link User} objects.
   */
  @Get
  public CompletableFuture<ResponseSchema<List<User>>> getAllUsers() {
    List<User> allUsers = userService.getAllUsers();

    ResponseSchema<List<User>> response = new ResponseSchema<>(allUsers);
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Gets an {@link User} object by its {@code USER_ID}.
   *
   * @param id the unique ID associate with a user.
   * @return {@link User} object with the target ID.
   * @throws EntityNotFoundException if user is not found.
   */
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

  /**
   * Creates a new {@link User} object and stores it in the database.
   * 
   * @param user {@Link UserInfo} object stores client inputed values for the new {@link User}.
   * @return New {@Link User} object created and saved in the databse.
   * @throws InvalidParameterException if {@Link UserInfo} user does not contain sufficient
   * or valid new user information. See {@link UserServices} for specifics.
   */
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

  /**
   * Edits an existing {@link User} object and updates it in the database.
   * 
   * @param user {@Link UserInfo} object stores client inputed values for the new {@link User}.
   * @return New {@Link User} object created and saved in the databse.
   * @throws InvalidParameterException if {@Link UserInfo} user does not contain a user id.
   * @throws EntityNotFoundException if {@Link UserInfo} user contains an id that does not exist
   * in the database.
   */
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

  /**
   * Deletes an existing {@link User} object from the database.
   * 
   * @param id Unique Id associated with the {@link User} object to be deleted.
   * @return Nothing on successful deletion.
   * @throws EntityNotFoundException when the id does not match an existing {@link User} object.
   * in the database.
   */
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
