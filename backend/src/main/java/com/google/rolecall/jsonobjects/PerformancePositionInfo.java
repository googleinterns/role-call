package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

@JsonDeserialize(builder = AutoValue_PerformancePositionInfo.Builder.class)
@AutoValue
public abstract class PerformancePositionInfo {
  @Nullable
  @JsonProperty("positionId")
  public abstract Integer positionId();

  @Nullable
  @JsonProperty("positionOrder")
  public abstract Integer positionOrder();

  @Nullable
  @JsonProperty("casts")
  public abstract List<PerformanceCastInfo> performanceCasts();

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
    return new AutoValue_PerformancePositionInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("positionId")
    public abstract Builder setPositionId(Integer positionId);

    @JsonProperty("positionOrder")
    public abstract Builder setPositionOrder(Integer positionOrder);

    @JsonProperty("casts")
    public abstract Builder setPerformanceCasts(List<PerformanceCastInfo> performanceCasts);

    public abstract PerformancePositionInfo build();
  }
}
