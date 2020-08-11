package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastMemberRepository;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/* Utility classes for accessing Users while mantaining database consistencies. */
@Service("userServices")
public class UserServices {
  
  private final UserRepository userRepo;
  private final CastMemberRepository castMemberRepo;

  public List<User> getAllUsers() {
    List<User> allUsers = new ArrayList<>();
    userRepo.findAll().forEach(allUsers::add);

    return allUsers;
  }

  public User getUser(Integer id) throws EntityNotFoundException, InvalidParameterException {
    if (id == null) {
      throw new InvalidParameterException("Missing id");
    }

    Optional<User> queryResult = userRepo.findById(id);

    if (!queryResult.isPresent()) {
        throw new EntityNotFoundException(String.format("userid %d does not exist", id));
    }

    return queryResult.get();
  }

  /** 
   * Creates a new {@link User} and adds it to the database with isActive set to true.
   * 
   * @param newUser {@link UserInfo} containing information describing the new user.
   * @return The new {@link User} created and stored.
   * @throws InvalidParameterException When firstName, lastName, or email are null in
   *    {@link UserInfo} newUser and when the email is malformatted or already exists.
   */
  public User createUser(UserInfo newUser) throws InvalidParameterException {
    if(newUser.email() == null) {
      throw new InvalidParameterException("User requires email address");
    } else if(!validateEmail(newUser.email())) {
      throw new InvalidParameterException("User requires valid email address");
    } else if(userRepo.findByEmailIgnoreCase(newUser.email()).isPresent()) {
      throw new InvalidParameterException(String.format("A user with email %s already exists",
          newUser.email()));
    }
    
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

    return userRepo.save(user);
  }

  /**
   * Edits an existing {@link User} and updates it in the database.
   * 
   * @param newUser {@link UserInfo} containing information describing the user edits.
   * @return The updated {@link User}.
   * @throws EntityNotFoundException The id from {@link UserInfo} newUser does not exist in the
   *    database.
   * @throws InvalidParameterException {@link User} has no id
   */
  public User editUser(UserInfo newUser) throws EntityNotFoundException, InvalidParameterException {
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

    try {
      return userRepo.save(builder.build());
    } catch(InvalidParameterException e) { 
      // Unreachable unless an invalid object exists in the database
      throw new Error(String.format(
          "Tried to edit User with id %d with invalid properties", newUser.id()));
    }
  }

  /** 
   * Deletes an existing {@link User} object by id.
   * 
   * @param id Unique id for the {@link User} object to be deleted
   * @throws EntityNotFoundException The id does not match and existing {@link User}
   *    in the database.
   */
  public void deleteUser(int id) throws EntityNotFoundException, InvalidParameterException {
    User user = getUser(id);

    if(castMemberRepo.findFirstByUser(user).isPresent()) {
      throw new InvalidParameterException("User involved in cast or performances cannot be deleted. Change is active.");
    }

    userRepo.deleteById(id);
  }

  /* Determines if an email has a valid email format. */
  private boolean validateEmail(String email) {
    // Found at https://regexlib.com/REDetails.aspx?regexp_id=26
    String pattern = "^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)"
        + "|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$";
    return Pattern.matches(pattern, email);
  }

  public UserServices(UserRepository userRepo, CastMemberRepository castMemberRepo) {
    this.userRepo = userRepo;
    this.castMemberRepo = castMemberRepo;
  }
}
