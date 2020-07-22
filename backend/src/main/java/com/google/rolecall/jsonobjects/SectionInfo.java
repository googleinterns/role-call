package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import java.util.List;
import javax.annotation.Nullable;

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

  @JsonCreator
  public static SectionInfo create(@Nullable @JsonProperty("id") Integer id,
      @Nullable @JsonProperty("name") String name, @Nullable @JsonProperty("notes") String notes,
      @Nullable @JsonProperty("length") Integer length,
      @Nullable @JsonProperty("positions") List<PositionInfo> positions) {
    return newBuilder()
        .setId(id)
        .setName(name)
        .setNotes(notes)
        .setLength(length)
        .setPositions(positions)
        .build();
  }

  public static Builder newBuilder() {
    return new AutoValue_SectionInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    public abstract Builder setId(Integer id);

    public abstract Builder setName(String name);

    public abstract Builder setNotes(String notes);

    public abstract Builder setLength(Integer length);

    public abstract Builder setPositions(List<PositionInfo> positions);

    public abstract SectionInfo build();
  }
}
