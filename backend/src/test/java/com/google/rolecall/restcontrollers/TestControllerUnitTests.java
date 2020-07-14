package com.google.rolecall.restcontrollers;

import static com.google.common.truth.Truth.assertThat;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.UnimplementedOperationException;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class TestControllerUnitTests {

  private TestController controller;

  @BeforeEach
  public void init() {
    controller = new TestController();
  }

  @Test
  public void paramGetValueReturn_success() throws Exception {
    //Execute
    String response = controller.sayHello("Jared").get();

    // Assert
    assertThat(response).isEqualTo("Hello Jared");
  }

  @Test
  public void postInvokeError_failure() throws Exception {
    //Execute
    UnimplementedOperationException exception = assertThrows(UnimplementedOperationException.class, controller::throwException);

    // Assert
    assertThat(exception).hasMessageThat().isEqualTo("POST is not defined for this endpoint");
  }
}
