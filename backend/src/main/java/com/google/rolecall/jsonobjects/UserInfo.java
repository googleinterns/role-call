package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import java.util.Calendar;
import javax.annotation.Nullable;

/* Json representation of User class for serializing and deserializing. */
@JsonDeserialize(builder = AutoValue_UserInfo.Builder.class)
@AutoValue
public abstract class UserInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("firstName")
  public abstract String firstName();

  @Nullable
  @JsonProperty("lastName")
  public abstract String lastName();

  @Nullable
  @JsonProperty("email")
  public abstract String email();

  @Nullable
  @JsonProperty("dateJoined")
  @JsonFormat(pattern="MM-dd-yyyy")
  public abstract Calendar dateJoined();

  @Nullable
  @JsonProperty("emergencyContactName")
  public abstract String emergencyContactName();

  @Nullable
  @JsonProperty("emergencyContactNumber")
  public abstract String emergencyContactNumber();

  @Nullable
  @JsonProperty("comments")
  public abstract String comments();

  @Nullable
  @JsonProperty("isActive")
  public abstract Boolean isActive();

  @Nullable
  @JsonProperty("canLogin")
  public abstract Boolean canLogin();

  @Nullable
  @JsonProperty("admin")
  public abstract Boolean admin();

  @Nullable
  @JsonProperty("notifications")
  public abstract Boolean notifications();

  @Nullable
  @JsonProperty("managePerformances")
  public abstract Boolean managePerformances();

  @Nullable
  @JsonProperty("manageCasts")
  public abstract Boolean manageCasts();

  @Nullable
  @JsonProperty("managePieces")
  public abstract Boolean managePieces();

  @Nullable
  @JsonProperty("manageRoles")
  public abstract Boolean manageRoles();

  @Nullable
  @JsonProperty("manageRules")
  public abstract Boolean manageRules();

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
    return new AutoValue_UserInfo.Builder();
  }

  @AutoValue.Builder
  public abstract static class Builder {
    @JsonProperty("id")
    public abstract Builder setId(Integer id);

    @JsonProperty("firstName")
    public abstract Builder setFirstName(String firstName);

    @JsonProperty("lastName")
    public abstract Builder setLastName(String lastName);

    @JsonProperty("email")
    public abstract Builder setEmail(String email);

    @JsonProperty("dateJoined")
    public abstract Builder setDateJoined(Calendar dateJoined);

    @JsonProperty("emergencyContcatName")
    public abstract Builder setEmergencyContactName(String emergencyContcatName);

    @JsonProperty("emergencyContactName")
    public abstract Builder setEmergencyContactNumber(String emergencyContactNumber);

    @JsonProperty("comments")
    public abstract Builder setComments(String comments);

    @JsonProperty("isActive")
    public abstract Builder setIsActive(Boolean isActive);

    @JsonProperty("canLogin")
    public abstract Builder setCanLogin(Boolean canLogin);

    @JsonProperty("admin")
    public abstract Builder setAdmin(Boolean admin);

    @JsonProperty("notifications")
    public abstract Builder setNotifications(Boolean notifications);

    @JsonProperty("managePerformances")
    public abstract Builder setManagePerformances(Boolean managePerformances);

    @JsonProperty("manageCasts")
    public abstract Builder setManageCasts(Boolean manageCasts);

    @JsonProperty("managePieces")
    public abstract Builder setManagePieces(Boolean managePieces);

    @JsonProperty("manageRoles")
    public abstract Builder setManageRoles(Boolean manageRoles);
    
    @JsonProperty("manageRules")
    public abstract Builder setManageRules(Boolean manageRules);

    public abstract UserInfo build();
  }
}
