package com.google.rolecall.services;

import static com.google.common.truth.Truth.assertThat;
import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserServiceTests {
  
  private UserRepository userRepo;
  private UserServices userService;
  private UserInfo newUser;
  private User user;
  private int invalidId = 30;
  private int id = 1;
  private String firstName = "Jared";
  private String lastName = "Hirsch";
  private String email = "goodEmail@gmail.com";
  private Date dateJoined = new Date(1,1,1);
  private String emergencyContactName = "Mom";
  private String emergencyContactNumber = "333-333-3333";
  private String comments = "A good boi.";
  private Boolean isActive = true;

  @BeforeEach
  public void init() {
    userRepo = mock(UserRepository.class);
    userService = new UserServices(userRepo);
    newUser = spy(new UserInfo());
    user = new User(firstName, lastName, email, dateJoined, emergencyContactName,
        emergencyContactNumber, comments, isActive);
    lenient().doReturn(Optional.of(user)).when(userRepo).findById(id);
    lenient().doReturn(Collections.singletonList(user)).when(userRepo).findAll();
    lenient().doReturn(Optional.empty()).when(userRepo).findById(invalidId);
    lenient().doReturn(Optional.of(user)).when(userRepo).findByEmailIgnoreCase(email);
    lenient().doReturn(user).when(userRepo).save(user);
  }

  @Test
  public void getAllUsers_success() throws Exception {
    // Execute
    List<User> response = userService.getAllUsers();

    // Assert
    assertThat(response).containsExactly(user);
  }

  @Test
  public void getUserById_success() throws Exception {
    // Execute
    User response = userService.getUser(id);

    //
    assertThat(response).isEqualTo(user);
    assertThat(response.getFirstName()).isEqualTo(firstName);
    assertThat(response.getLastName()).isEqualTo(lastName);
    assertThat(response.getEmail()).isEqualTo(email);
    assertThat(response.getDateJoined().get()).isEqualTo(dateJoined);
    assertThat(response.getEmergencyContactName()).isEqualTo(emergencyContactName);
    assertThat(response.getEmergencyContactNumber()).isEqualTo(emergencyContactNumber);
    assertThat(response.getComments()).isEqualTo(comments);
    assertThat(response.isActive()).isEqualTo(isActive.booleanValue());
  }

  @Test
  public void getInvalidUserById_failure() throws Exception {
    // Execute
    EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
        () -> { userService.getUser(invalidId); });

    // Assert
    assertThat(exception).hasMessageThat().contains(Integer.toString(invalidId));
  }

  @Test
  public void createNewUserAllProperties_success() throws Exception {
    // Setup
    Date newdateJoined = new Date(2,2,2);
    newUser.setFirstName("Logan");
    newUser.setLastName("Hirsch");
    newUser.setEmail("email@gmail.com");
    newUser.setDateJoined(newdateJoined);
    newUser.setEmergencyContactName("Mem");
    newUser.setEmergencyContactNumber("5");
    newUser.setComments("lit");

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("email@gmail.com");

    // Execute
    userService.createUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
  }

  @Test
  public void createNewUserMinimumProperties_success() throws Exception {
    // Setup
    newUser.setFirstName("Logan");
    newUser.setLastName("Hirsch");
    newUser.setEmail("email@gmail.com");

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("email@gmail.com");

    // Execute
    userService.createUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
  }

  @Test
  public void createNewUserMissingAllProperties_failure() throws Exception {
    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("'email'");
    assertThat(exception).hasMessageThat().contains("'firstName'");
    assertThat(exception).hasMessageThat().contains("'lastName'");
  }

  @Test
  public void createNewUserBadEmail_failure() throws Exception {
    // Setup
    newUser.setFirstName("Logan");
    newUser.setLastName("Hirsch");
    newUser.setEmail("badEmail");

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("badEmail");

    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("'valid email address'");
  }

  @Test
  public void createNewUserEmailExists_failure() throws Exception {
    // Setup
    newUser.setFirstName("Logan");
    newUser.setLastName("Hirsch");
    newUser.setEmail(email);

    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("'unique email'");
  }

  @Test
  public void editAllUserProperties_success() throws Exception {
    // Setup
    Date newdateJoined = new Date(2,2,2);
    newUser.setFirstName("Logan");
    newUser.setLastName("taco");
    newUser.setEmail("email@gmail.com"); // Should be ignored
    newUser.setDateJoined(newdateJoined);
    newUser.setEmergencyContactName("Mem");
    newUser.setEmergencyContactNumber("5");
    newUser.setComments("lit");
    newUser.setIsActive(false);

    // Mock
    lenient().doReturn(id).when(newUser).getId();

    // Execute
    userService.editUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(user.getFirstName()).isEqualTo("Logan");
    assertThat(user.getLastName()).isEqualTo("taco");
    assertThat(user.getEmail()).isEqualTo(email);
    assertThat(user.getDateJoined().get()).isEqualTo(newdateJoined);
    assertThat(user.getEmergencyContactName()).isEqualTo("Mem");
    assertThat(user.getEmergencyContactNumber()).isEqualTo("5");
    assertThat(user.getComments()).isEqualTo("lit");
    assertThat(user.isActive()).isFalse();
  }

  @Test
  public void editUserFirstNameOnly_success() throws Exception {
    // Setup
    newUser.setFirstName("Logan");

    // Mock
    lenient().doReturn(id).when(newUser).getId();

    // Execute
    userService.editUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(user.getFirstName()).isEqualTo("Logan");
    assertThat(user.getLastName()).isEqualTo(lastName);
    assertThat(user.getEmail()).isEqualTo(email);
    assertThat(user.getDateJoined().get()).isEqualTo(dateJoined);
    assertThat(user.getEmergencyContactName()).isEqualTo(emergencyContactName);
    assertThat(user.getEmergencyContactNumber()).isEqualTo(emergencyContactNumber);
    assertThat(user.getComments()).isEqualTo(comments);
    assertThat(user.isActive()).isTrue();
  }

  @Test
public void editInvalidUser_failure() throws Exception {
    // Mock
    lenient().doReturn(invalidId).when(newUser).getId();

    // Execute
    EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
    () -> { userService.editUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains(Integer.toString(invalidId));
}

  @Test
  public void deleteUser_success() {
    // Mock
    lenient().doNothing().when(userRepo).deleteById(id);

    // Execute
    userService.deleteUser(id);

    // Assert
    verify(userRepo, times(1)).deleteById(id);
  }
}
