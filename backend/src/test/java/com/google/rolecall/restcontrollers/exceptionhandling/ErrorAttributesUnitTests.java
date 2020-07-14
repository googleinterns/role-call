package com.google.rolecall.restcontrollers.exceptionhandling;

import static com.google.common.truth.Truth.assertThat;

import java.util.Map;

import javax.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.error.ErrorAttributeOptions.Include;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.WebRequest;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class ErrorAttributesUnitTests {
  
  @Test
  public void getCustomFallThroughErrorFormat_success() throws Exception {
    // Setup
    CustomErrorAttributes attributes = new CustomErrorAttributes();
    ErrorAttributeOptions options = ErrorAttributeOptions.defaults().including(Include.MESSAGE);

    //Mock
    WebRequest request = mock(WebRequest.class);
    lenient().doReturn(HttpStatus.BAD_REQUEST.value()).when(request)
        .getAttribute(RequestDispatcher.ERROR_STATUS_CODE, RequestAttributes.SCOPE_REQUEST);
    lenient().doReturn(new Exception("Exception")).when(request)
        .getAttribute(RequestDispatcher.ERROR_EXCEPTION, RequestAttributes.SCOPE_REQUEST);

    // Execute
    Map<String, Object> errorOut = attributes.getErrorAttributes(request, options);

    // Assert
    Object error = errorOut.get("error");
    Object status = errorOut.get("status");
    assertThat(error).isNotNull();
    assertThat(status).isNotNull();
    assertThat(error).isInstanceOf(String.class);
    assertThat(status).isInstanceOf(Integer.class);
    assertThat(error).isEqualTo("Exception");
    assertThat(status).isEqualTo(HttpStatus.BAD_REQUEST.value());
  }
}
