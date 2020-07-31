package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import javax.annotation.Nullable;

/* Json representation of Position class for serializing and deserializing. */
@JsonDeserialize(builder = AutoValue_PositionInfo.Builder.class)
@AutoValue
public abstract class PositionInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("name")
  public abstract String name();

  @Nullable
  @JsonProperty("notes")
  public abstract String notes();

  @Nullable
  @JsonProperty("order")
  public abstract Integer order();

  @Nullable
  @JsonProperty("size")
  public abstract Integer size();

  @Nullable
  public abstract Boolean delete();

  /* Every PositionInfo should be unique unless it's being comapred to itself */
  @Override
  public boolean equals(Object object) {
    return this == object;
  }

  /* Object hashcode */
  @Override
  public int hashCode() {
    return super.hashCode();
  }

  public static Builder newBuilder() {
    return new AutoValue_PositionInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("name")
    public abstract Builder setName(String name);

    @JsonProperty("notes")
    public abstract Builder setNotes(String notes);

    @JsonProperty("order")
    public abstract Builder setOrder(Integer order);

    @JsonProperty("size")
    public abstract Builder setSize(Integer size);

    @JsonProperty("delete")
    public abstract Builder setDelete(Boolean delete);

    public abstract PositionInfo build();
  }
}
