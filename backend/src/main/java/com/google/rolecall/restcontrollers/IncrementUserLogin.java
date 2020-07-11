package com.google.rolecall.restcontrollers;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.RequestExceptions.InvalidArgumentException;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestParam;

/* Endpoints for manipulating and fetching the loginCounter value for a User based on id. */
@Endpoint("/api/increment-login")
public class IncrementUserLogin extends AsyncRestEndpoint{
  
  private final UserRepository userRepo;
  
  @Get
  public CompletableFuture<Integer> getUserLoginCounter(@RequestParam(value="userid", 
      required=true) int id) {
    Optional<User> queryResult = userRepo.findById(id);
    if (!queryResult.isPresent()) {
      return CompletableFuture.failedFuture(
          new InvalidArgumentException(String.format("userid %d does not exist", id)));
    } 

    return CompletableFuture.completedFuture(queryResult.get().getLoginCount());
  }
  
  @Post
  public CompletableFuture<Integer> postIncrementUserLogin(@RequestParam(value="userid",
      required=true) int id) {
    Optional<User> queryResult = userRepo.findById(id);
    if (!queryResult.isPresent()) {
      return CompletableFuture.failedFuture(
          new InvalidArgumentException(String.format("userid %d does not exist", id)));
    } 

    User user = queryResult.get();
    user.incrementLogin();

    userRepo.save(user);
    return CompletableFuture.completedFuture(user.getLoginCount());
  }

  @Autowired
  public IncrementUserLogin(UserRepository userRepo) {
    this.userRepo = userRepo;
  }
}
