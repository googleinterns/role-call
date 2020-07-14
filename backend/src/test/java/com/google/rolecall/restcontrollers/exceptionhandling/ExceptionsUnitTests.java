package com.google.rolecall.restcontrollers.exceptionhandling;

import static com.google.common.truth.Truth.assertThat;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class ExceptionsUnitTests {
  
  @Test
  public void constructInvalidArgumentsException_Success() {
    // Setup
    EntityNotFoundException ex = new EntityNotFoundException("Issue Description");

    //Assert
    assertThat(ex).hasMessageThat().isEqualTo("Issue Description");
  }

  @Test
  public void constructUnsupportedOperationException_Success() {
    // Setup
    UnsupportedOperationException ex = new UnsupportedOperationException("Issue Description");

    //Assert
    assertThat(ex).hasMessageThat().isEqualTo("Issue Description");
  }
}
