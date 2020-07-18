package com.google.rolecall.models;

import static com.google.common.truth.Truth.assertThat;

import java.util.Calendar;

import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserUnitTests {

  private String firstName = "Jared";
  private String lastName = "Hirsch";
  private String email = "email@email.com";
  private Calendar dateJoined = null;
  private String emergencyContactName = "Mom";
  private String emergencyContactNumber = "(333) 333-3333";
  private String comments = "It's me";
  private boolean isActive = true;
  private Boolean canLogin = true;
  private Boolean admin = true;
  private Boolean notifications = false;
  private Boolean managePerformances = true;
  private Boolean manageCasts = false;
  private Boolean managePieces = true;
  private Boolean manageRoles = false;
  private Boolean manageRules = true;
  
  /** A User object created but not saved to the database should not have an id. */
  @Test
  public void getId_failure() throws Exception {
    // Setup
    User user;
    User.Builder builder = User.newBuilder()
      .setFirstName(firstName)
      .setLastName(lastName)
      .setEmail(email)
      .setDateJoined(dateJoined)
      .setEmergencyContactName(emergencyContactName)
      .setEmergencyContactNumber(emergencyContactNumber)
      .setComments(comments)
      .setIsActive(isActive)
      .setCanLogin(canLogin)
      .setAdmin(admin)
      .setRecievesNotifications(notifications)
      .setManagePerformances(managePerformances)
      .setManageCasts(manageCasts)
      .setManagePieces(managePieces)
      .setManageRoles(manageRoles)
      .setManageRules(manageRules);
    try {
      user = builder.build();
    } catch(InvalidParameterException e) {
      throw new Error("Unable to creat User");
    }

    // Assert
    assertThat(user.getId()).isNull();
  }
}
