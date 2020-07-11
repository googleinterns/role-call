package com.google.rolecall.restcontrollers;

import static com.google.common.truth.Truth.assertThat;
import com.google.rolecall.restcontrollers.RequestExceptions.InvalidArgumentException;
import com.google.rolecall.restcontrollers.RequestExceptions.InvalidPermissionsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class ExceptionsUnitTests {
  
  @Test
  public void constructInvalidPermissionsException_Success() {
    // Setup
    InvalidPermissionsException ex = new InvalidPermissionsException("Issue Description");

    //Assert
    assertThat(ex).hasMessageThat().isEqualTo("Issue Description");
  }  
  
  @Test
  public void constructInvalidArgumentsException_Success() {
    // Setup
    InvalidArgumentException ex = new InvalidArgumentException("Issue Description");

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
