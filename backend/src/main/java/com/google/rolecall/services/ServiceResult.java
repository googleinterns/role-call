package com.google.rolecall.services;

import java.util.ArrayList;
import java.util.List;

public class ServiceResult<T> {
  private T result;
  private List<String> warnings = new ArrayList<>();

  public T getResult() {
    return result;
  }

  public List<String> getWarnings() {
    return warnings;
  }

  public void setResult(T result) {
    this.result = result;
  }

  public void addWarning(String warning) {
    warnings.add(warning);
  }

  public ServiceResult(T result, List<String> warnings) {
    this.result = result;
    this.warnings = warnings;
  }

  public ServiceResult() {
  }
}
