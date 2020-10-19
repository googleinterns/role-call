package com.google.rolecall.restcontrollers;

import static com.google.common.truth.Truth.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import java.util.Collections;
import java.security.Principal;
import java.util.Calendar;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastMemberRepository;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.UserServices;
import com.google.rolecall.util.DefaultUsers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserManagementUnitTests {

  private UserServices userService;
  private UserManagement controller;
  private User user;
  private int id = 1;
  private String firstName = "Jared";
  private String lastName = "Hirsch";
  private String email = "goodEmail@gmail.com";
  private Calendar dateJoined = null;
  private Boolean isAdmin = true;
  private Boolean isChoreographer = true;
  private Boolean isDancer = true;
  private Boolean isOther = true;
  private Boolean canLogin = true;
  private Boolean notifications = false;
  private Boolean managePerformances = true;
  private Boolean manageCasts = false;
  private Boolean managePieces = true;
  private Boolean manageRoles = false;
  private Boolean manageRules = true;
  private String emergencyContactName = "Mom";
  private String emergencyContactNumber = "333-333-3333";
  private String comments = "A good boi.";
  private Boolean isActive = true;

  @BeforeEach
  public void init() {

    userService = spy(new UserServices(mock(UserRepository.class),
        mock(CastMemberRepository.class),null));
    controller = new UserManagement(userService);
    User.Builder builder = User.newBuilder()
      .setFirstName(firstName)
      .setLastName(lastName)
      .setEmail(email)
      .setDateJoined(dateJoined)
      .setIsAdmin(isAdmin)
      .setIsChoreographer(isAdmin)
      .setIsDancer(isDancer)
      .setIsOther(isOther)
      .setCanLogin(canLogin)
      .setRecievesNotifications(notifications)
      .setManagePerformances(managePerformances)
      .setManageCasts(manageCasts)
      .setManagePieces(managePieces)
      .setManageRoles(manageRoles)
      .setManageRules(manageRules)
      .setEmergencyContactName(emergencyContactName)
      .setEmergencyContactNumber(emergencyContactNumber)
      .setComments(comments)
      .setIsActive(isActive)
      ;
    try {
      user = builder.build();
    } catch(InvalidParameterException e) {
      throw new Error("Unable to create User");
    }
  }

  @Test
  public void getAllUsers_success() throws Exception {
    // Mock
    lenient().doReturn(Collections.singletonList(user)).when(userService).getAllUsers();

    // Execute
    CompletableFuture<ResponseSchema<List<UserInfo>>> response = controller.getAllUsers();

    // Assert
    assertThat(response.isCompletedExceptionally()).isFalse();
    ResponseSchema<List<UserInfo>> schema = response.get();
    assertThat(schema.getWarnings()).isEmpty();
    assertThat(schema.getData().size()).isEqualTo(1);
    assertThat(schema.getData().toString()).contains(user.toUserInfo().toString());
  }

  @Test
  public void getSingleUser_success() throws Exception {
    // Mock
    lenient().doReturn(user).when(userService).getUser(id);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response = controller.getSingleUser(id);

    // Assert
    assertThat(response.isCompletedExceptionally()).isFalse();
    ResponseSchema<UserInfo> schema = response.get();
    assertThat(schema.getWarnings()).isEmpty();
    assertThat(schema.getData().toString()).isEqualTo(user.toUserInfo().toString());
  }

  @Test
  public void getSingleInvalidUser_failure() throws Exception {
    // Mock
    lenient().doThrow(new EntityNotFoundException(String.format("userid %d does not exist", id)))
        .when(userService).getUser(id);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response = controller.getSingleUser(id);

    // Assert
    assertThat(response.isCompletedExceptionally()).isTrue();

    Throwable thrown = null;
    try {
      response.get();
    } catch(ExecutionException e) {
      thrown = e.getCause();
    }
    assertThat(thrown).isNotNull();
    assertThat(thrown).isInstanceOf(EntityNotFoundException.class);
    assertThat(thrown).hasMessageThat().contains(Integer.toString(id));
  }

  @Test
  public void postCreateUser_success() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().build();
    User user = new User();
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doReturn(user).when(userService).createUser(newUser);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response = 
        controller.createUser(principal, newUser);

    // Assert
    assertThat(response.isCompletedExceptionally()).isFalse();
    verify(userService, times(1)).createUser(newUser);
  }

  @Test
  public void postCreateBadUser_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().build();
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doThrow(new InvalidParameterException("Missing params")).when(userService).createUser(newUser);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response =
        controller.createUser(principal, newUser);

    // Assert
    assertThat(response.isCompletedExceptionally()).isTrue();
    Throwable thrown = null;
    try {
      response.get();
    } catch(ExecutionException e) {
      thrown = e.getCause();
    }
    assertThat(thrown).isNotNull();
    assertThat(thrown).isInstanceOf(InvalidParameterException.class);
    assertThat(thrown).hasMessageThat().contains("Missing params");
    verify(userService, times(1)).createUser(newUser);
  }

  @Test
  public void patchEditUser_success() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().setId(id).build();
    User user = new User();
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doReturn(user).when(userService).editUser(newUser);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response =
        controller.editUser(principal, newUser);

    // Assert
    assertThat(response.isCompletedExceptionally()).isFalse();
    verify(userService, times(1)).editUser(newUser);
    assertThat(response.get().getData().toString()).isEqualTo(user.toUserInfo().toString());
  }

  @Test
  public void patchEditUserNoId_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().build();
    Principal principal = DefaultUsers.getAdminPrincipal();
    
    // Mock
    lenient().doThrow(new EntityNotFoundException("Wrong exception")).when(userService).editUser(newUser);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response =
        controller.editUser(principal, newUser);

    // Assert
    assertThat(response.isCompletedExceptionally()).isTrue();
    Throwable thrown = null;
    try {
      response.get();
    } catch(ExecutionException e) {
      thrown = e.getCause();
    }
    assertThat(thrown).isNotNull();
    assertThat(thrown).isInstanceOf(InvalidParameterException.class);
    assertThat(thrown).hasMessageThat().contains("Missing id");
    verify(userService, never()).createUser(newUser);
  }

  @Test
  public void patchEditUserBadId_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().setId(id).build();
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doThrow(new EntityNotFoundException("Bad id")).when(userService).editUser(newUser);

    // Execute
    CompletableFuture<ResponseSchema<UserInfo>> response =
        controller.editUser(principal, newUser);

    // Assert
    assertThat(response.isCompletedExceptionally()).isTrue();
    Throwable thrown = null;
    try {
      response.get();
    } catch(ExecutionException e) {
      thrown = e.getCause();
    }
    assertThat(thrown).isNotNull();
    assertThat(thrown).isInstanceOf(EntityNotFoundException.class);
    assertThat(thrown).hasMessageThat().contains("Bad id");
    verify(userService, never()).createUser(newUser);
  }

  @Test
  public void deleteUser_success() throws Exception {
    // Setup
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doNothing().when(userService).deleteUser(id);

    // Execute
    CompletableFuture<Void> response = controller.deleteUser(principal, id);

    // Assert
    assertThat(response.isCompletedExceptionally()).isFalse();
    verify(userService, times(1)).deleteUser(id);
  }

  @Test
  public void deleteUserBadId_failure() throws Exception {
    // Setup
    Principal principal = DefaultUsers.getAdminPrincipal();

    // Mock
    lenient().doThrow(new EntityNotFoundException("Bad id")).when(userService).deleteUser(id);

    // Execute
    CompletableFuture<Void> response = controller.deleteUser(principal, id);

    // Assert
    assertThat(response.isCompletedExceptionally()).isTrue();
    Throwable thrown = null;
    try {
      response.get();
    } catch(ExecutionException e) {
      thrown = e.getCause();
    }
    assertThat(thrown).isNotNull();
    assertThat(thrown).isInstanceOf(EntityNotFoundException.class);
    assertThat(thrown).hasMessageThat().contains("Bad id");
  }
}
