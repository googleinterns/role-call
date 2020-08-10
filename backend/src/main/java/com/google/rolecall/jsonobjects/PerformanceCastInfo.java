package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

@JsonDeserialize(builder = AutoValue_PerformanceCastInfo.Builder.class)
@AutoValue
public abstract class PerformanceCastInfo {
  @Nullable
  @JsonProperty("castNumber")
  public abstract Integer castNumber();

  @Nullable
  @JsonProperty("members")
  public abstract List<PerformanceCastMemberInfo> performanceCastMembers();

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
    return new AutoValue_PerformanceCastInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("castNumber")
    public abstract Builder setCastNumber(Integer castNumber);

    @JsonProperty("members")
    public abstract Builder setPerformanceCastMembers(List<PerformanceCastMemberInfo> performanceCastMembers);

    public abstract PerformanceCastInfo build();
  }
}
