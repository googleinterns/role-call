package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

@JsonDeserialize(builder = AutoValue_PerformanceSectionInfo.Builder.class)
@AutoValue
public abstract class PerformanceSectionInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("sectionPosition")
  public abstract Integer sectionPosition();

  @Nullable
  @JsonProperty("primaryCast")
  public abstract Integer primaryCast();

  @Nullable
  @JsonProperty("sectionId")
  public abstract Integer sectionId();

  @Nullable
  @JsonProperty("positions")
  public abstract List<PerformancePositionInfo> positions();

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

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("sectionPosition")
    public abstract Builder setSectionPosition(Integer sectionPosition);
    
    @JsonProperty("primaryCast")
    public abstract Builder setPrimaryCast(Integer primaryCast);
    
    @JsonProperty("sectionId")
    public abstract Builder setSectionId(Integer sectionId);

    @JsonProperty("positions")
    public abstract Builder setPositions(List<PerformancePositionInfo> performancePositions);

    @JsonProperty("delete")
    public abstract Builder setDelete(Boolean delete);

    public abstract PerformanceSectionInfo build();
  }
}
