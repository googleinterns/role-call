package com.google.rolecall.restcontrollers;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.GenericMessage;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.services.NotificationServices;
import java.util.concurrent.CompletableFuture;

/** Endpoints for manipulating User objects. */
@Endpoint("/api/notification")
public class Notification extends AsyncRestEndpoint {
  
  private final NotificationServices service;

  @Post
  public CompletableFuture<ResponseSchema<GenericMessage>> processNotification() {
    try {
      service.process();   
    } catch(Exception e) {
      return CompletableFuture.failedFuture(e);
    }    
    
    ResponseSchema<GenericMessage> response = new ResponseSchema<>(GenericMessage.newBuilder().setMessage("OK").build());
    return CompletableFuture.completedFuture(response);
  }

  public Notification(NotificationServices service) {
    this.service = service;
  }
}
