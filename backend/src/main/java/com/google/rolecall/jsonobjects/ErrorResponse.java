package com.google.rolecall.jsonobjects;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

/* Format of Error Response Object to be serialized by Jacksonlib. */
public class ErrorResponse {
  public final String error;
  public final int status;

  public Map<String,Object> getMap() {
    Map<String, Object> attr = new HashMap<>();

    attr.put("error", error);
    attr.put("status", status);

    return attr;
  }

  public ResponseEntity<Object> getResponse(HttpHeaders headers) {
    return ResponseEntity.status(status).body(this);
  }

  public ErrorResponse(String error, int status) {
    this.error = error;
    this.status = status;
  }
}
