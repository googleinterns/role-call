package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import java.util.List;
import javax.annotation.Nullable;

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

    @JsonProperty("positions")
    public abstract Builder setPositions(List<PositionInfo> positions);

    public abstract SectionInfo build();
  }
}
