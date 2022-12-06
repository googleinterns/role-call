package com.google.rolecall.jsonobjects;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;

/* Json representation of UserAsset class for serializing and deserializing. */
@AutoValue
@JsonDeserialize(builder = AutoValue_UserAssetInfo.Builder.class)
public abstract class UserAssetInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("type")
  public abstract String type();

  @Nullable
  @JsonProperty("fileType")
  public abstract String fileType();

  @Nullable
  @JsonProperty("dateUploaded")
  public abstract Long dateUploaded();

  @Nullable
  @JsonProperty("ownerId")
  public abstract Integer ownerId();

  /* Every UserInfo should be unique unless it's being comapred to itself */
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
    return new AutoValue_UserAssetInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("type")
    public abstract Builder setType(String type);

    @JsonProperty("fileType")
    public abstract Builder setFileType(String fileType);

    @JsonProperty("dateUploaded")
    public abstract Builder setDateUploaded(Long dateUploaded);

    @JsonProperty("ownerId")
    public abstract Builder setOwnerId(Integer ownerId);

    public abstract UserAssetInfo build();
  }
}
