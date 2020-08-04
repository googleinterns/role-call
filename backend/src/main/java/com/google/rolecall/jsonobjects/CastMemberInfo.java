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
  @JsonProperty("subCastId")
  public abstract Integer subCastId();

  @Nullable
  @JsonProperty("order")
  public abstract Integer order();

  @Nullable
  @JsonIgnore
  public abstract Boolean delete();

  @JsonCreator
  public static CastMemberInfo create(@Nullable @JsonProperty("id") Integer id, 
      @Nullable @JsonProperty("userId") Integer userId,
      @Nullable @JsonProperty("subCastId") Integer subCastId,
      @Nullable @JsonProperty("order") Integer order,
      @Nullable @JsonProperty("delete") Boolean delete) {
    return new AutoValue_CastMemberInfo(id, userId, subCastId, order, delete);
  }
}
