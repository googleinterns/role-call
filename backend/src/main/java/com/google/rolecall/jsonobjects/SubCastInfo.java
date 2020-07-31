package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

@AutoValue
@JsonDeserialize(builder = AutoValue_SubCastInfo.Builder.class)
public abstract class SubCastInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("castNumber")
  public abstract Integer castNumber();

  @Nullable
  @JsonProperty("positionId")
  public abstract Integer positionId();

  @Nullable
  @JsonProperty("members")
  public abstract List<CastMemberInfo> members();

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
    return new AutoValue_SubCastInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("castNumber")
    public abstract Builder setCastNumber(Integer castNumber);

    @JsonProperty("positionId")
    public abstract Builder setPositionId(Integer positionId);

    @JsonProperty("members")
    public abstract Builder setMembers(List<CastMemberInfo> members);

    @JsonProperty("delete")
    public abstract Builder setDelete(Boolean delete);

    public abstract SubCastInfo build();
  }
}
