package com.google.rolecall.restcontrollers;

import static com.google.common.truth.Truth.assertThat;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.RequestExceptions.InvalidArgumentException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class IncrementUserLoginUnitTests {

  private IncrementUserLogin controller;

  private UserRepository userRepo;

  @BeforeEach
  public void init() {
    userRepo = mock(UserRepository.class);
    controller = new IncrementUserLogin(userRepo);
    for(int i=1; i <=3; i++) {
      User user = new User();
      for(int c =0; c<i; c++) {
        user.incrementLogin();
      }
      lenient().when(userRepo.findById(i)).thenReturn(Optional.of(user));
      lenient().when(userRepo.save(user)).thenReturn(user);
    }
  }
    
  @Test
  public void getUserLoginValue_success() throws Exception {
    // Execute
    Integer response1 = controller.getUserLoginCounter(1).get();
    Integer response2 = controller.getUserLoginCounter(3).get();
    
    // Assert
    assertThat(response1).isEqualTo(1);
    assertThat(response2).isEqualTo(3);
  }

  @Test
  public void invalidUserLoginValue_failure() throws Exception {
    
    // Execute
    boolean isCorrectException = controller.getUserLoginCounter(4)
        .handle((msg, ex) -> {
          if (ex instanceof InvalidArgumentException) {
            return true;
          }
          return false;
        }).get();
    
    // Assert
    assertThat(isCorrectException).isTrue();
  }

  @Test
  public void incrementUserLoginValue_success() throws Exception {
    // Execute
    Integer response = controller.postIncrementUserLogin(1).get();

    // Assert
    assertThat(response).isEqualTo(2);
  }

  @Test
  public void incrementInvailidUserLoginValue_failure() throws Exception {
    // Execute
    boolean isCorrectException = controller.postIncrementUserLogin(4)
        .handle((msg, ex) -> {
          if (ex instanceof InvalidArgumentException) {
            return true;
          }
          return false;
        }).get();;

    // Assert
    assertThat(isCorrectException).isTrue();
  }
}
