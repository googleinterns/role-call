package com.google.rolecall.jsonobjects;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

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

    /* Every SectionInfo should be unique unless it's being comapred to itself */
  @Override
  public boolean equals(Object object) {
    return this == object;
  }

  /* Object hashcode */
  @Override
  public int hashCode() {
    return super.hashCode();
  }

  @JsonCreator
  public static PositionInfo create(@Nullable @JsonProperty("id") Integer id,
      @Nullable @JsonProperty("name") String name, @Nullable @JsonProperty("notes") String notes,
      @Nullable @JsonProperty("order") Integer order) {
    return newBuilder()
        .setId(id)
        .setName(name)
        .setNotes(notes)
        .setOrder(order)
        .build();
  }

  public static Builder newBuilder() {
    return new AutoValue_PositionInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    public abstract Builder setId(Integer id);

    public abstract Builder setName(String name);

    public abstract Builder setNotes(String notes);

    public abstract Builder setOrder(Integer order);

    public abstract PositionInfo build();
  }
}
