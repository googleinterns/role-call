package com.google.rolecall.restcontrollers.exceptionhandling;

import com.google.rolecall.jsonobjects.ErrorResponse;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.UnimplementedOperationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/* Handles controller level default exception handling and custom exception exception handling. */
@RestControllerAdvice
public class CustomControllerExceptionHandler extends ResponseEntityExceptionHandler {

  // Override specific default exception responses.
  @Override
  protected ResponseEntity<Object> handleNoHandlerFoundException(NoHandlerFoundException exception,
      HttpHeaders headers, HttpStatus status, WebRequest request) {
    String invalidUrl = exception.getRequestURL();
    ErrorResponse error = new ErrorResponse(String.format("Path %s does not exist.", invalidUrl),
        status.value());

    return error.getResponse(headers);
  }

  @Override
  protected ResponseEntity<Object> handleMissingServletRequestParameter(
      MissingServletRequestParameterException exception, HttpHeaders headers, 
      HttpStatus status, WebRequest request) {
    String message = String.format("Parameter %s was not of type %s.",
        exception.getParameterName(), exception.getParameterType());
    ErrorResponse error = new ErrorResponse(message, status.value());

    return error.getResponse(headers);
  }

  // Override general exception handler response format.
  protected ResponseEntity<Object> handleExceptionInternal(
      Exception exception, @Nullable Object body, HttpHeaders headers, HttpStatus status,
      WebRequest request) {
    ErrorResponse error = new ErrorResponse(exception.getMessage(), status.value());

    return error.getResponse(headers);
  }

  // Override Custom Exceptions
  @ExceptionHandler(EntityNotFoundException.class)
  @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
  protected ErrorResponse handleEntityNotFound(EntityNotFoundException exception) {
    return new ErrorResponse(exception.getMessage(), HttpStatus.UNPROCESSABLE_ENTITY.value());
  }

  @ExceptionHandler(UnimplementedOperationException.class)
  @ResponseStatus(HttpStatus.NOT_IMPLEMENTED)
  protected ErrorResponse handleUnimplementedOperation(UnimplementedOperationException exception) {
    return new ErrorResponse(exception.getMessage(), HttpStatus.NOT_IMPLEMENTED.value());
  }

  @ExceptionHandler(InvalidParameterException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  protected ErrorResponse handleInvalidParameterOperation(InvalidParameterException exception) {
    return new ErrorResponse(exception.getMessage(), HttpStatus.CONFLICT.value());
  }

  
}
