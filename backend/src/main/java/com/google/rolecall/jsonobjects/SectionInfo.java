package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import com.google.rolecall.models.Section.Type;
import java.util.List;
import javax.annotation.Nullable;

/* Json representation of Section class for serializing and deserializing. */
@JsonDeserialize(builder = AutoValue_SectionInfo.Builder.class)
@AutoValue
public abstract class SectionInfo {
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
  @JsonProperty("length")
  public abstract Integer length();

  @Nullable
  @JsonProperty("siblingId")
  public abstract Integer siblingId();

  @Nullable
  @JsonProperty("type")
  public abstract Type type();

  @Nullable
  @JsonProperty("positions")
  public abstract List<PositionInfo> positions();

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

  public static Builder newBuilder() {
    return new AutoValue_SectionInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("name")
    public abstract Builder setName(String name);

    @JsonProperty("notes")
    public abstract Builder setNotes(String notes);

    @JsonProperty("length")
    public abstract Builder setLength(Integer length);

    @JsonProperty("siblingId")
    public abstract Builder setSiblingId(Integer siblingId);

    @JsonProperty("type")
    public abstract Builder setType(Type type);

    @JsonProperty("positions")
    public abstract Builder setPositions(List<PositionInfo> positions);

    public abstract SectionInfo build();
  }
}
