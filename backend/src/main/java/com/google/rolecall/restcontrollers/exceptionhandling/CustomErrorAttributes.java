package com.google.rolecall.restcontrollers.exceptionhandling;

import java.util.Map;

import com.google.rolecall.jsonobjects.ErrorResponse;

import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.WebRequest;

/* Fall through error formatter for any non specified or unexpected exceptions. */
@Component
public class CustomErrorAttributes extends DefaultErrorAttributes {
  @Override
  public Map<String, Object> getErrorAttributes(WebRequest request,
      ErrorAttributeOptions options) {
    Map<String, Object> errorAttr = super.getErrorAttributes(request, options);
    HttpStatus status = HttpStatus.valueOf(Integer.parseInt(errorAttr.get("status").toString()));
    ErrorResponse error = new ErrorResponse(errorAttr.get("message").toString(), status.value());

    return error.buildMap();
  }
}
