package com.google.rolecall.restcontrollers.exceptionhandling;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/* Custom exceptions for handling invalid request based errors. */
public final class RequestExceptions {
  
  public static class EntityNotFoundException extends Exception {
    public EntityNotFoundException(String message) {
      super(message);
    }
  } 

  public static class UnimplementedOperationException extends Exception {
    public UnimplementedOperationException(String message) {
      super(message);
    }
  }

  public static class InvalidParameterException extends Exception {
    public InvalidParameterException(String message) {
      super(message);
    }
  }

  @ResponseStatus(HttpStatus.FORBIDDEN)
  public static class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
      super(message);
    }
  }
}
