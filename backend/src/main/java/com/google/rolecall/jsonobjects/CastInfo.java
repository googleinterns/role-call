package com.google.rolecall.jsonobjects;

import java.util.List;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

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
  @JsonProperty("comments")
  public abstract String comments();

  @Nullable
  @JsonProperty("color")
  public abstract String color();

  @Nullable
  @JsonProperty("positionId")
  public abstract Integer positionId();

  @Nullable
  @JsonProperty("members")
  public abstract List<CastMemberInfo> members();

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
    return new AutoValue_CastInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("name")
    public abstract Builder setName(String name);

    @JsonProperty("comments")
    public abstract Builder setComments(String comments);

    @JsonProperty("color")
    public abstract Builder setColor(String color);

    @JsonProperty("positionId")
    public abstract Builder setPositionId(Integer positionId);

    @JsonProperty("members")
    public abstract Builder setMembers(List<CastMemberInfo> members);

    public abstract CastInfo build();
  }
}
