package com.google.rolecall.jsonobjects;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

@JsonDeserialize(builder = AutoValue_PerformanceCastInfo.Builder.class)
@AutoValue
public abstract class PerformanceCastMemberInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("order")
  public abstract Integer order();

  @Nullable
  @JsonProperty("userId")
  public abstract Integer userId();

  @Nullable
  @JsonProperty("performing")
  public abstract Boolean performing();

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

  public static Builder newBuilder() {
    return new AutoValue_PerformanceCastMemberInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder { 
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("order")
    public abstract Builder setOrder(Integer order);
    
    @JsonProperty("userId")
    public abstract Builder setUserId(Integer userId);
    
    @JsonProperty("performing")
    public abstract Builder setPerforming(Boolean performing);

    @JsonProperty("delete")
    public abstract Builder setDelete(Boolean delete);

    public abstract PerformanceCastMemberInfo build();
  }
}