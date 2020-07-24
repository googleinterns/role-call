package com.google.rolecall.jsonobjects;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

@AutoValue
public abstract class CastMemberInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("userId")
  public abstract Integer userId();

  @Nullable
  @JsonProperty("castId")
  public abstract Integer castId();

  @Nullable
  @JsonIgnore
  public abstract Boolean delete();

  @JsonCreator
  public static CastMemberInfo create(@JsonProperty("id") Integer id, 
      @JsonProperty("userId") Integer userId, @JsonProperty("castId") Integer castId,
      @Nullable @JsonProperty("delete") Boolean delete) {
    return new AutoValue_CastMemberInfo(id, userId, castId, delete);
  }
}
