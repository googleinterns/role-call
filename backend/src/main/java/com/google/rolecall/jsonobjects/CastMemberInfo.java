package com.google.rolecall.jsonobjects;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonDeserialize(builder = AutoValue_CastMemberInfo.Builder.class)
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
  @JsonProperty("delete")
  public abstract Boolean delete();

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
    return new AutoValue_CastMemberInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("userId")
    public abstract Builder setUserId(Integer userId);

    @JsonProperty("subCastId")
    public abstract Builder setSubCastId(Integer subCastId);

    @JsonProperty("order")
    public abstract Builder setOrder(Integer order);

    @JsonProperty("delete")
    public abstract Builder setDelete(Boolean delete);

    public abstract CastMemberInfo build();
  }
  
}
