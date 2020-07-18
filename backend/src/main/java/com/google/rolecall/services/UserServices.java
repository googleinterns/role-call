package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/* Utility classes for accessing Users while mantaining database consistencies. */
@Service
public class UserServices {
  
  private final UserRepository userRepo;

  public List<User> getAllUsers() {
    List<User> allUsers = new ArrayList<>();
    userRepo.findAll().forEach(allUsers::add);

    return allUsers;
  }

  public User getUser(int id) throws EntityNotFoundException{
    Optional<User> queryResult = userRepo.findById(id);

    if (!queryResult.isPresent()) {
        throw new EntityNotFoundException(String.format("userid %d does not exist", id));
    }

    return queryResult.get();
  }

  /* Creates a new User and adds it to the database with isActive set to true.
   * Requires firstName, lastName, and email fields and validates the email.
   * Emails are always stored as lowercase and cannot already exist in the system.
   * Throws exception on missing properties or invalid email.
   */
  public User createUser(UserInfo newUser) throws InvalidParameterException {
    User user = User.newBuilder()
        .setFirstName(newUser.firstName())
        .setLastName(newUser.lastName())
        .setEmail(newUser.email())
        .setDateJoined(newUser.dateJoined())
        .setEmergencyContactName(newUser.emergencyContactName())
        .setEmergencyContactNumber(newUser.emergencyContactNumber())
        .setComments(newUser.comments())
        .setIsActive(newUser.isActive())
        .setCanLogin(newUser.canLogin())
        .setAdmin(newUser.admin())
        .setRecievesNotifications(newUser.notifications())
        .setManagePerformances(newUser.managePerformances())
        .setManageCasts(newUser.manageCasts())
        .setManagePieces(newUser.managePieces())
        .setManageRoles(newUser.manageRoles())
        .setManageRules(newUser.manageRules())
        .build();

    if(!validateEmail(user.getEmail())) {
      throw new InvalidParameterException("User requires valid email address");
    } else if(userRepo.findByEmailIgnoreCase(user.getEmail()).isPresent()) {
      throw new InvalidParameterException("User requires unique email address");
    }

    return userRepo.save(user);
  }

  /* Edits an existing User according to supplied properties. Does not change a User's email.*/
  public User editUser(UserInfo newUser) throws EntityNotFoundException {
    User.Builder builder = this.getUser(newUser.id()).toBuilder()
        .setFirstName(newUser.firstName())
        .setLastName(newUser.lastName())
        .setDateJoined(newUser.dateJoined())
        .setEmergencyContactName(newUser.emergencyContactName())
        .setEmergencyContactNumber(newUser.emergencyContactNumber())
        .setComments(newUser.comments())
        .setIsActive(newUser.isActive())
        .setCanLogin(newUser.canLogin())
        .setAdmin(newUser.admin())
        .setRecievesNotifications(newUser.notifications())
        .setManagePerformances(newUser.managePerformances())
        .setManageCasts(newUser.manageCasts())
        .setManagePieces(newUser.managePieces())
        .setManageRoles(newUser.manageRoles())
        .setManageRules(newUser.manageRules());
    
    User user;
    try {
      user = builder.build();
    } catch(InvalidParameterException e) { 
      // Unreachable unless an invalid object exists in the database
      throw new Error("Tried to edit User with invalid properties");
    }
    
    return userRepo.save(user);
  }

  public void deleteUser(int id) throws EntityNotFoundException {
    getUser(id);
    userRepo.deleteById(id);
  }

  /* Determines if an email has a valid email format. */
  private boolean validateEmail(String email) {
    // Found at https://regexlib.com/REDetails.aspx?regexp_id=26
    String pattern = "^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)"
        + "|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$";
    return Pattern.matches(pattern, email);
  }

  public UserServices(UserRepository userRepo) {
    this.userRepo = userRepo;
  }
}
