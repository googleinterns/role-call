package com.google.rolecall.jsonobjects;

import java.util.LinkedList;
import java.util.List;

/* Format for any content sent in a response body as a JSON. */
public class ResponseSchema<T> {
  private final T data;
  private final List<String> warnings;

  public T getData() {
    return data;
  }

  public List<String> getWarnings() {
    return warnings;
  }

  public ResponseSchema(T data) {
    this.data = data;
    warnings = new LinkedList<>();
  }

  public ResponseSchema(T data, List<String> warnings) {
    this.data = data;
    this.warnings = warnings;
  }
}
