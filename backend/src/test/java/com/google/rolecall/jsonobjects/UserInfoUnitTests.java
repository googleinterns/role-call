package com.google.rolecall.jsonobjects;

import static com.google.common.truth.Truth.assertThat;
import java.util.Calendar;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class UserInfoUnitTests {
  
  @Test
  public void validToString_success() throws Exception {
    // Setup
    UserInfo user = UserInfo.newBuilder()
      .setId(1)
      .setFirstName("Logan")
      .setLastName("taco")
      .setEmail("email@gmail.com")
      .setDateJoined(null)
      .setEmergencyContactName("Mem")
      .setEmergencyContactNumber("5")
      .setComments("lit")
      .setIsActive(false)
      .setCanLogin(false)
      .setAdmin(false)
      .setNotifications(true)
      .setManagePerformances(false)
      .setManageCasts(true)
      .setManagePieces(false)
      .setManageRoles(true)
      .setManageRules(false)
      .build();

    // Execute
    String out = user.toString();

    // Assert
    assertThat(out).contains("1");
    assertThat(out).contains("Logan");
    assertThat(out).contains("email@gmail.com");
    assertThat(out).contains("Mem");
    assertThat(out).contains("5");
    assertThat(out).contains("lit");
    assertThat(out).contains("false");
    assertThat(out).contains("true");
  }

  @Test
  public void simpleHash_success() throws Exception {
    // Setup
    UserInfo user1 = UserInfo.newBuilder().build();
    UserInfo user2 = UserInfo.newBuilder().build();

    // Execute
    int hash1 = user1.hashCode();
    int hash2 = user2.hashCode();

    // Assert
    assertThat(hash1).isEqualTo(user1.hashCode());
    assertThat(hash2).isEqualTo(user2.hashCode());
    assertThat(hash1).isNotEqualTo(hash2);
  }
}