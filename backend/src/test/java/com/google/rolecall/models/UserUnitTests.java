package com.google.rolecall.models;

import static com.google.common.truth.Truth.assertThat;

import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserUnitTests {

  private User user;
  private String firstName = "Jared";
  private String lastName = "Hirsch";
  private String email = "email@email.com";
  private Date dateOfBirth = null;
  private String emergencyContactName = "Mom";
  private String emergencyContactNumber = "(333) 333-3333";
  private String comments = "It's me";
  private boolean isActive = true;

  @BeforeEach
  public void init() {
    user = new User(firstName, lastName, email, dateOfBirth, emergencyContactName,
        emergencyContactNumber, comments, isActive);
  }

  @Test
  public void setFirstName_success() throws Exception {
    //Execute
    user.setFirstName("NotJared");

    // Assert
    assert(user.getFirstName()).equals("NotJared");
  }

  @Test
  public void setLastName_success() throws Exception {
    //Execute
    user.setLastName("NotHirsch");

    // Assert
    assertThat(user.getLastName()).isEqualTo("NotHirsch");
  }

  @Test
  public void setEmail_success() throws Exception {
    //Execute
    user.setEmail("Notemail@email.com");

    // Assert
    assertThat(user.getEmail()).isEqualTo("Notemail@email.com");
  }

  /** A User object created but not saved to the database should not have an id. */
  @Test
  public void getId_failure() throws Exception {
    // Assert
    assertThat(user.getId()).isNull();
  }
}
