package com.google.rolecall.jsonobjects;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import io.micrometer.core.lang.Nullable;

@AutoValue
@JsonDeserialize(builder = AutoValue_CastInfo.Builder.class)
public abstract class CastInfo {
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
  @JsonProperty("sectionId")
  public abstract Integer sectionId();

  @Nullable
  @JsonProperty("subCasts")
  public abstract List<SubCastInfo> subCasts();
  
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
    return new AutoValue_CastInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("name")
    public abstract Builder setName(String name);

    @JsonProperty("notes")
    public abstract Builder setNotes(String notes);

    @JsonProperty("sectionId")
    public abstract Builder setSectionId(Integer sectionId);

    @JsonProperty("subCasts")
    public abstract Builder setSubCasts(List<SubCastInfo> subCasts);

    public abstract CastInfo build();
  }
}