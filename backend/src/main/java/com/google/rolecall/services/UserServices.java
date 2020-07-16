package com.google.rolecall.services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

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
  public void createUser(UserInfo newUser) throws InvalidParameterException {
    User user = new User();

    List<String> missingProperties = new ArrayList<>();

    user.setFirstName(newUser.getFirstName());
    if(user.getFirstName() == null) {
      missingProperties.add("'firstName' ");
    }

    user.setLastName(newUser.getLastName());
    if(newUser.getLastName() == null) {
      missingProperties.add("'lastName' ");
    }

    String email = newUser.getEmail().toLowerCase();
    user.setEmail(email);
    if(email == null) {
      missingProperties.add("'email'");
    } else if(!validateEmail(email)) {
      missingProperties.add("'valid email adress'");
    } else if(userRepo.findByEmailIgnoreCase(email).isPresent()) {
      missingProperties.add("'unique email'");
    }

    user.setDateOfBirth(newUser.getDateOfBirth());
    user.setEmergencyContactName(newUser.getEmergencyContactName());
    user.setEmergencyContactNumber(newUser.getEmergencyContactNumber());
    user.setComments(newUser.getComments());
    user.setIsActive(true);

    if(missingProperties.size() > 0) {
      StringBuilder builder = new StringBuilder().append("Missing properties: ");
      missingProperties.forEach(builder::append);
      throw new InvalidParameterException(builder.toString());
    }

    userRepo.save(user);
  }

  /* Edits an existing User according to supplied properties. Does not change a User's email.*/
  public void editUser(UserInfo newUser) throws EntityNotFoundException {
    User user = this.getUser(newUser.getId());

    String firstName = newUser.getFirstName();
    if(firstName != null) {
      user.setFirstName(firstName);
    }

    String lastName = newUser.getLastName();
    if(lastName != null) {
      user.setLastName(lastName);
    }

    Date dateOfBirth = newUser.getDateOfBirth(); 
    if(dateOfBirth != null) {
      user.setDateOfBirth(dateOfBirth);
    }

    String emergencyContactName = newUser.getEmergencyContactName();
    if(emergencyContactName != null) {
      user.setEmergencyContactName(emergencyContactName);
    }

    String emergencyContactNumber = newUser.getEmergencyContactNumber();
    if(emergencyContactNumber != null) {
      user.setEmergencyContactNumber(emergencyContactNumber);
    }

    String comments = newUser.getComments();
    if(emergencyContactNumber != null) {
      user.setComments(comments);
    }

    boolean isActive = newUser.isActive();
    if(emergencyContactNumber != null) {
      user.setIsActive(isActive);;
    }

    userRepo.save(user);
  }

  public void deleteUser(int id) {
    // Todo: Update requirements as new endpoints are added
    userRepo.deleteById(id);
  }

  /* Determines if an email has a valid email format. */
  private boolean validateEmail(String email) {
    // TODO: Implement validation logic
    return true;
  }

  public UserServices(UserRepository userRepo) {
    this.userRepo = userRepo;
  }
}
