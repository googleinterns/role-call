package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

import io.micrometer.core.lang.Nullable;

@AutoValue
@JsonDeserialize(builder = AutoValue_UnavailabilityInfo.Builder.class)
public abstract class UnavailabilityInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("status")
  public abstract Boolean status();

  @Nullable
  @JsonProperty("userId")
  public abstract Integer userId();

  @Nullable
  @JsonProperty("reason")
  public abstract String reason();

  @Nullable
  @JsonProperty("description")
  public abstract String description();

  @Nullable
  @JsonProperty("startDate")
  public abstract Long startDate();

  @Nullable
  @JsonProperty("endDate")
  public abstract Long endDate();

  /* Every UnavailabilityInfo should be unique unless it's being comapred to itself */
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
    return new AutoValue_UnavailabilityInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class  Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("userId")
    public abstract Builder setUserId(Integer userId);

    @JsonProperty("reason")
    public abstract Builder setReason(String reason);

    @JsonProperty("description")
    public abstract Builder setDescription(String description);

    @JsonProperty("startDate")
    public abstract Builder setStartDate(Long startDate);

    @JsonProperty("endDate")
    public abstract Builder setEndDate(Long endDate);

    @JsonProperty("status")
    public abstract Builder setStatus(Boolean status);



    public abstract UnavailabilityInfo build();
  }
}
