package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import com.google.rolecall.models.Performance.Status;

@JsonDeserialize(builder = AutoValue_PerformanceInfo.Builder.class)
@AutoValue
public abstract class PerformanceInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("title")
  public abstract String title();

  @Nullable
  @JsonProperty("description")
  public abstract String description();

  @Nullable
  @JsonProperty("city")
  public abstract String city();

  @Nullable
  @JsonProperty("state")
  public abstract String state();

  @Nullable
  @JsonProperty("country")
  public abstract String country();

  @Nullable
  @JsonProperty("venue")
  public abstract String venue();

  @Nullable
  @JsonProperty("dateTime")
  public abstract Long dateTime();

  @Nullable
  @JsonProperty("status")
  public abstract Status status();

  @Nullable
  @JsonProperty("hasAbsence")
  public abstract Boolean hasAbsence();

  @Nullable
  @JsonProperty("performanceSections")
  public abstract List<PerformanceSectionInfo> performanceSections();

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
    return new AutoValue_PerformanceInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("title")
    public abstract Builder setTitle(String title);

    @JsonProperty("description")
    public abstract Builder setDescription(String description);

    @JsonProperty("city")
    public abstract Builder setCity(String city);
    
    @JsonProperty("state")
    public abstract Builder setState(String state);

    @JsonProperty("country")
    public abstract Builder setCountry(String country);

    @JsonProperty("venue")
    public abstract Builder setVenue(String venue);

    @JsonProperty("dateTime")
    public abstract Builder setDateTime(Long dateTime);
    
    @JsonProperty("status")
    public abstract Builder setStatus(Status status);

    @JsonProperty("hasAbsence")
    public abstract Builder setHasAbsence(Boolean hasAbsence);


    
    @JsonProperty("performanceSections")
    public abstract Builder setPerformanceSections(List<PerformanceSectionInfo> performanceSections);

    public abstract PerformanceInfo build();
  }
}
