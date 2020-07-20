package com.google.rolecall.restcontrollers.exceptionhandling;

import static com.google.common.truth.Truth.assertThat;

import java.util.Map;

import com.google.rolecall.jsonobjects.ErrorResponse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class ErrorResponseUnitTests {
  
  @Test
  public void constructErrorResponse_success() throws Exception {
    // Setup
    String message = "This is an error";
    int code = 400;
    
    // Execute
    ErrorResponse error = new ErrorResponse(message, code);

    // Assert
    assertThat(error.error).isEqualTo(message);
    assertThat(error.status).isEqualTo(code);
  }

  @Test
  public void getErrorResponseMap_success() throws Exception {
    // Setup
    String message = "This is an error";
    int code = 400;
    ErrorResponse error = new ErrorResponse(message, code);

    // Execute
    Map<String, Object> out = error.buildMap();

    // Assert
    assertThat(out.get("error")).isEqualTo(message);
    assertThat(out.get("status")).isEqualTo(code);
  }

  @Test
  public void getErrorResponseEntity_success() throws Exception {
    // Setup
    String message = "This is an error";
    int code = 400;
    HttpHeaders header = new HttpHeaders();
    ErrorResponse error = new ErrorResponse(message, code);

    // Execute
    ResponseEntity<Object> out = error.getResponse(header);

    // Assert
    assertThat(out.getBody()).isEqualTo(error);
    assertThat(out.getHeaders()).isEqualTo(header);
    assertThat(out.getStatusCodeValue()).isEqualTo(code);
  }
}
