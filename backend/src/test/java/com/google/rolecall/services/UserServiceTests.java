package com.google.rolecall.services;

import static com.google.common.truth.Truth.assertThat;
import static org.junit.Assert.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.Collections;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.models.CastMember;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastMemberRepository;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.stubbing.Answer;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserServiceTests {
  
  private UserRepository userRepo;
  private CastMemberRepository castMemberRepo;
  private UserServices userService;
  private User user;
  private int invalidId = 30;
  private int id = 1;
  private String firstName = "Jared";
  private String lastName = "Hirsch";
  private String email = "goodemail@gmail.com";
  private String phoneNumber = "123-456-7890";
  private Calendar dateJoined = (new Calendar.Builder()).setDate(1, 1, 1).build();
  private Boolean isAdmin = true;
  private Boolean isCoreographer = true;
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
    userRepo = mock(UserRepository.class);
    castMemberRepo = mock(CastMemberRepository.class);
    userService = new UserServices(userRepo, castMemberRepo, null);
    User.Builder builder = User.newBuilder()
      .setFirstName(firstName)
      .setLastName(lastName)
      .setEmail(email)
      .setPhoneNumber(phoneNumber)
      .setDateJoined(dateJoined)
      .setIsAdmin(isAdmin)
      .setIsCoreographer(isCoreographer)
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
      throw new Error("Unable to creat User");
    }
    lenient().doReturn(Optional.of(user)).when(userRepo).findById(id);
    lenient().doReturn(Collections.singletonList(user)).when(userRepo).findAll();
    lenient().doReturn(Optional.empty()).when(userRepo).findById(invalidId);
    lenient().doReturn(Optional.of(user)).when(userRepo).findByEmailIgnoreCase(email);
    lenient().when(userRepo.save(any(User.class))).thenAnswer(new Answer<User>() {
        @Override
        public User answer(InvocationOnMock invocation) throws Throwable {
          Object[] args = invocation.getArguments();
          return (User) args[0];
        }
    });
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
    assertThat(response.getPhoneNumber()).isEqualTo(phoneNumber);
    assertThat(response.getDateJoined().get()).isEqualTo(dateJoined);
    assertThat(response.isAdmin()).isEqualTo(isAdmin.booleanValue());
    assertThat(response.isCoreographer()).isEqualTo(isCoreographer.booleanValue());
    assertThat(response.isDancer()).isEqualTo(isDancer.booleanValue());
    assertThat(response.isOther()).isEqualTo(isOther.booleanValue());
    assertThat(response.canLogin()).isEqualTo(canLogin.booleanValue());
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
    Calendar newdateJoined = (new Calendar.Builder()).setDate(2, 2, 2).build();
    UserInfo newUser = UserInfo.newBuilder()
      .setFirstName("Logan")
      .setLastName("Hirsch")
      .setEmail("email@gmail.com")
      .setPhoneNumber("123-456-7890")
      .setDateJoined(newdateJoined)
      .setIsAdmin(true)
      .setIsCoreographer(true)
      .setIsDancer(true)
      .setIsOther(false)
      .setCanLogin(false)
      .setNotifications(false)
      .setManagePerformances(true)
      .setManageCasts(true)
      .setManagePieces(true)
      .setManageRoles(true)
      .setManageRules(true)
      .setEmergencyContactName("Mem")
      .setEmergencyContactNumber("6")
      .setComments("5")
      .build();

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("email@gmail.com");

    // Execute
    User userOut = userService.createUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(userOut.getFirstName()).isEqualTo("Logan");
    assertThat(userOut.getLastName()).isEqualTo("Hirsch");
    assertThat(userOut.getEmail()).isEqualTo("email@gmail.com");
    assertThat(userOut.getPhoneNumber()).isEqualTo("123-456-7890");
    assertThat(userOut.getDateJoined().get()).isEqualTo(newdateJoined);
    assertThat(userOut.isAdmin()).isTrue();
    assertThat(userOut.isCoreographer()).isTrue();
    assertThat(userOut.isDancer()).isTrue();
    assertThat(userOut.isOther()).isFalse();
    assertThat(userOut.canLogin()).isFalse();
    assertThat(userOut.recievesNotifications()).isFalse();
    assertThat(userOut.canManagePerformances()).isTrue();
    assertThat(userOut.canManageCasts()).isTrue();
    assertThat(userOut.canManagePieces()).isTrue();
    assertThat(userOut.canManageRoles()).isTrue();
    assertThat(userOut.canManageRules()).isTrue();
    assertThat(userOut.getEmergencyContactName()).isEqualTo("Mem");
    assertThat(userOut.getEmergencyContactNumber()).isEqualTo("6");
    assertThat(userOut.getComments()).isEqualTo("5");
    assertThat(userOut.isActive()).isTrue();
  }

  @Test
  public void createNewUserMinimumProperties_success() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
      .setFirstName("Logan")
      .setLastName("Hirsch")
      .setEmail("email@gmail.com")
      .build();

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("email@gmail.com");

    // Execute
    User userOut = userService.createUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(userOut.getFirstName()).isEqualTo("Logan");
    assertThat(userOut.getLastName()).isEqualTo("Hirsch");
    assertThat(userOut.getEmail()).isEqualTo("email@gmail.com");
    assertThat(userOut.getPhoneNumber()).isEqualTo("123-456-7890");
    assertThat(userOut.getDateJoined().isEmpty()).isTrue();
    assertThat(userOut.isAdmin()).isFalse();
    assertThat(userOut.isCoreographer()).isFalse();
    assertThat(userOut.isDancer()).isFalse();
    assertThat(userOut.isOther()).isFalse();
    assertThat(userOut.canLogin()).isFalse();
    assertThat(userOut.recievesNotifications()).isTrue();
    assertThat(userOut.canManagePerformances()).isFalse();
    assertThat(userOut.canManageCasts()).isFalse();
    assertThat(userOut.canManagePieces()).isFalse();
    assertThat(userOut.canManageRoles()).isFalse();
    assertThat(userOut.canManageRules()).isFalse();
    assertThat(userOut.getEmergencyContactName()).isEqualTo("");
    assertThat(userOut.getEmergencyContactNumber()).isEqualTo("");
    assertThat(userOut.getComments()).isEqualTo("");
    assertThat(userOut.isActive()).isTrue();
  }

  @Test
  public void createNewUserMissingEmail_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().build();
    
    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("email");
  }

  @Test
  public void createNewUserMissingAllPropertiesButEmail_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder().setEmail("email@email.com").build();
    
    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("firstName");
    assertThat(exception).hasMessageThat().contains("lastName");
  }

  @Test
  public void createNewUserBadEmail_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
      .setFirstName("Logan")
      .setLastName("Hirsch")
      .setEmail("badEmail")
      .build();

    // Mock
    lenient().doReturn(Optional.empty()).when(userRepo).findByEmailIgnoreCase("badEmail");

    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains("valid email address");
  }

  @Test
  public void createNewUserEmailExists_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
      .setFirstName("Logan")
      .setLastName("Hirsch")
      .setEmail(email)
      .build();

    // Execute
    InvalidParameterException exception = assertThrows(InvalidParameterException.class,
        () -> { userService.createUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains(email);
  }

  @Test
  public void editAllUserProperties_success() throws Exception {
    // Setup
    Calendar newdateJoined = (new Calendar.Builder()).setDate(2, 2, 2).build();
    UserInfo newUser = UserInfo.newBuilder()
      .setId(id)
      .setFirstName("Logan")
      .setLastName("taco")
      .setEmail("email@gmail.com") // Should be ignored
      .setPhoneNumber("098-765-4321")
      .setDateJoined(newdateJoined)
      .setIsAdmin(false)
      .setIsCoreographer(false)
      .setIsDancer(false)
      .setIsOther(true)
      .setCanLogin(false)
      .setNotifications(true)
      .setManagePerformances(false)
      .setManageCasts(true)
      .setManagePieces(false)
      .setManageRoles(true)
      .setManageRules(false)
      .setEmergencyContactName("Mem")
      .setEmergencyContactNumber("5")
      .setComments("lit")
      .setIsActive(false)
      .build();

    // Execute
    User userOut = userService.editUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(userOut.getFirstName()).isEqualTo("Logan");
    assertThat(userOut.getLastName()).isEqualTo("taco");
    assertThat(userOut.getEmail()).isEqualTo(email);
    assertThat(userOut.getPhoneNumber()).isEqualTo("098-765-4321");
    assertThat(userOut.getDateJoined().get()).isEqualTo(newdateJoined);
    assertThat(userOut.isAdmin()).isFalse();
    assertThat(userOut.isCoreographer()).isFalse();
    assertThat(userOut.isDancer()).isFalse();
    assertThat(userOut.isOther()).isTrue();
    assertThat(userOut.canLogin()).isFalse();
    assertThat(userOut.recievesNotifications()).isTrue();
    assertThat(userOut.canManagePerformances()).isFalse();
    assertThat(userOut.canManageCasts()).isTrue();
    assertThat(userOut.canManagePieces()).isFalse();
    assertThat(userOut.canManageRoles()).isTrue();
    assertThat(userOut.canManageRules()).isFalse();
    assertThat(userOut.getEmergencyContactName()).isEqualTo("Mem");
    assertThat(userOut.getEmergencyContactNumber()).isEqualTo("5");
    assertThat(userOut.getComments()).isEqualTo("lit");
    assertThat(userOut.isActive()).isFalse();
  }

  @Test
  public void editUserFirstNameOnly_success() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
        .setId(id)
        .setFirstName("Logan")
        .build();

    // Execute
    User userOut = userService.editUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(userOut.getFirstName()).isEqualTo("Logan");
    assertThat(userOut.getLastName()).isEqualTo(lastName);
    assertThat(userOut.getEmail()).isEqualTo(email);
    assertThat(userOut.getPhoneNumber()).isEqualTo(phoneNumber);
    assertThat(userOut.getDateJoined().get()).isEqualTo(dateJoined);
    assertThat(userOut.isAdmin()).isTrue();
    assertThat(userOut.isCoreographer()).isTrue();
    assertThat(userOut.isDancer()).isTrue();
    assertThat(userOut.isOther()).isTrue();
    assertThat(userOut.canLogin()).isTrue();
    assertThat(userOut.recievesNotifications()).isFalse();
    assertThat(userOut.canManagePerformances()).isTrue();
    assertThat(userOut.canManageCasts()).isFalse();
    assertThat(userOut.canManagePieces()).isTrue();
    assertThat(userOut.canManageRoles()).isFalse();
    assertThat(userOut.canManageRules()).isTrue();
    assertThat(userOut.getEmergencyContactName()).isEqualTo(emergencyContactName);
    assertThat(userOut.getEmergencyContactNumber()).isEqualTo(emergencyContactNumber);
    assertThat(userOut.getComments()).isEqualTo(comments);
    assertThat(userOut.isActive()).isTrue();
  }

  @Test
  public void editUserFirstNoChanges_success() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
        .setId(id)
        .build();

    // Execute
    User userOut = userService.editUser(newUser);

    // Assert
    verify(userRepo, times(1)).save(any(User.class));
    assertThat(userOut.getFirstName()).isEqualTo(firstName);
    assertThat(userOut.getLastName()).isEqualTo(lastName);
    assertThat(userOut.getEmail()).isEqualTo(email);
    assertThat(userOut.getPhoneNumber()).isEqualTo(phoneNumber);
    assertThat(userOut.getDateJoined().get()).isEqualTo(dateJoined);
    assertThat(userOut.isAdmin()).isTrue();
    assertThat(userOut.isCoreographer()).isTrue();
    assertThat(userOut.isDancer()).isTrue();
    assertThat(userOut.isOther()).isTrue();
    assertThat(userOut.canLogin()).isTrue();
    assertThat(userOut.recievesNotifications()).isFalse();
    assertThat(userOut.canManagePerformances()).isTrue();
    assertThat(userOut.canManageCasts()).isFalse();
    assertThat(userOut.canManagePieces()).isTrue();
    assertThat(userOut.canManageRoles()).isFalse();
    assertThat(userOut.canManageRules()).isTrue();
    assertThat(userOut.getEmergencyContactName()).isEqualTo(emergencyContactName);
    assertThat(userOut.getEmergencyContactNumber()).isEqualTo(emergencyContactNumber);
    assertThat(userOut.getComments()).isEqualTo(comments);
    assertThat(userOut.isActive()).isTrue();
  }

  @Test
  public void editInvalidUser_failure() throws Exception {
    // Setup
    UserInfo newUser = UserInfo.newBuilder()
        .setId(invalidId)
        .build();

    // Execute
    EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
    () -> { userService.editUser(newUser); });

    // Assert
    verify(userRepo, never()).save(any(User.class));
    assertThat(exception).hasMessageThat().contains(Integer.toString(invalidId));
}

  @Test
  public void deleteUser_success() throws Exception {
    // Mock
    lenient().doNothing().when(userRepo).deleteById(id);
    lenient().doReturn(Optional.of(new CastMember())).when(castMemberRepo).findFirstByUser(any(User.class));

    // Execute
    userService.deleteUser(id);

    // Assert
    verify(userRepo, times(1)).deleteById(id);
  }

  @Test
  public void deleteUserBadId_failure() throws Exception {
    // Execute
    EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
    () -> { userService.deleteUser(invalidId); });

    // Assert
    verify(userRepo, never()).deleteById(any(Integer.class));
    assertThat(exception).hasMessageThat().contains(Integer.toString(invalidId));
  }
}
