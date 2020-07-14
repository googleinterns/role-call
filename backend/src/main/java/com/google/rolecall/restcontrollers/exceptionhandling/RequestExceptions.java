package com.google.rolecall.restcontrollers.exceptionhandling;

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
}
