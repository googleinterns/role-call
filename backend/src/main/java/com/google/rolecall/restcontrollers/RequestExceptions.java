package com.google.rolecall.restcontrollers;

/* Custom exceptions for handling invalid request based errors. */
public final class RequestExceptions {
  
  public static class InvalidArgumentException extends Exception{
    public InvalidArgumentException(String message) {
      super(message);
    }
  } 

  public static class UnsupportedOperationException extends Exception{
    public UnsupportedOperationException(String message) {
      super(message);
    }
  }

  public static class InvalidPermissionsException extends Exception{
    public InvalidPermissionsException(String message) {
      super(message);
    }
  }
}
