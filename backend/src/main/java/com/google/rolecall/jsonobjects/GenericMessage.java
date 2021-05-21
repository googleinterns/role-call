package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import javax.annotation.Nullable;

/* Json representation of User class for serializing and deserializing. */
@AutoValue
@JsonDeserialize(builder = AutoValue_GenericMessage.Builder.class)
public abstract class GenericMessage {
  @Nullable
  @JsonProperty("message")
  public abstract String message();


  /* Every UserInfo should be unique unless it's being comapred to itself */
  @Override
  public boolean equals(Object object) {
    return this == object;
  }

  public static Builder newBuilder() {
    return new AutoValue_GenericMessage.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("message")
    public abstract Builder setMessage(String message);
    
    public abstract GenericMessage build();
  }
}
