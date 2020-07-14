package com.google.rolecall.restcontrollers.exceptionhandling;

import static com.google.common.truth.Truth.assertThat;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.UnimplementedOperationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.Mockito.mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class CustomExceptionHandlerUnitTests {
 
  private CustomControllerExceptionHandler handler;
  private HttpHeaders headers;
  private HttpStatus status;
  private WebRequest request;
  
  @BeforeEach
  public void init() {
    handler = new CustomControllerExceptionHandler();
    headers = new HttpHeaders();
    request = mock(WebRequest.class);
    status = HttpStatus.INTERNAL_SERVER_ERROR;
  }

  @Test
  public void handleNoHandlerFoundException_success() throws Exception {
    // Setup
    String req = "requestString";
    String url = "url";
    HttpHeaders wrongHeader = new HttpHeaders();
    NoHandlerFoundException exception = new NoHandlerFoundException(req, url, wrongHeader);

    // Execute
    ResponseEntity<Object> response = handler.handleNoHandlerFoundException(exception, 
        headers, status, request);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(status);
    assertThat(response.getHeaders()).isEqualTo(headers);
    Object body = response.getBody();
    assertThat(body).isInstanceOf(ErrorResponse.class);
    ErrorResponse error = (ErrorResponse) body;
    assertThat(error.error).isEqualTo(String.format("Path %s does not exist.", url));
    assertThat(error.status).isEqualTo(status.value());
  }

  @Test
  public void handleMissingServletRequestParameter_success() throws Exception {
    // Setup
    String param = "value";
    String type = "string";
    MissingServletRequestParameterException exception =
        new MissingServletRequestParameterException(param, type);

    // Execute
    ResponseEntity<Object> response = handler.handleMissingServletRequestParameter(exception,
        headers, status, request);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(status);
    assertThat(response.getHeaders()).isEqualTo(headers);
    Object body = response.getBody();
    assertThat(body).isInstanceOf(ErrorResponse.class);
    ErrorResponse error = (ErrorResponse) body;
    assertThat(error.error).isEqualTo(String.format("Parameter %s was not of type %s.",
         param, type));
    assertThat(error.status).isEqualTo(status.value());
  }

  @Test
  public void handleExceptionInternal_success() throws Exception {
    // Setup
    String message = "requestString";
    Exception exception = new Exception(message);

    // Execute
    ResponseEntity<Object> response = handler.handleExceptionInternal(exception, null,
        headers, status, request);

    // Assert
    assertThat(response.getStatusCode()).isEqualTo(status);
    assertThat(response.getHeaders()).isEqualTo(headers);

    Object body = response.getBody();
    assertThat(body).isInstanceOf(ErrorResponse.class);
    
    ErrorResponse error = (ErrorResponse) body;
    assertThat(error.error).isEqualTo(message);
    assertThat(error.status).isEqualTo(status.value());
  }

  @Test
  public void handleEntityNotFound_success() throws Exception {
    // Setup
    String message = "Missing Entity";
    EntityNotFoundException exception = new EntityNotFoundException(message);

    // Execute
    ErrorResponse response = handler.handleEntityNotFound(exception);

    // Assert
    assertThat(response.error).isEqualTo(message);
    assertThat(response.status).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY.value());
  }

  @Test
  public void handleUnsupportedOperation_success() throws Exception {
    // Setup
    String message = "Unsupported Operation";
    UnimplementedOperationException exception = new UnimplementedOperationException(message);

    // Execute
    ErrorResponse response = handler.handleUnimplementedOperation(exception);

    // Assert
    assertThat(response.error).isEqualTo(message);
    assertThat(response.status).isEqualTo(HttpStatus.NOT_IMPLEMENTED.value());
  }
}
