package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import java.util.Calendar;
import javax.annotation.Nullable;

/* Json representation of User class for serializing and deserializing. */
@AutoValue
@JsonDeserialize(builder = AutoValue_UserInfo.Builder.class)
public abstract class UserInfo {
  @Nullable
  @JsonProperty("id")
  public abstract Integer id();

  @Nullable
  @JsonProperty("firstName")
  public abstract String firstName();

  @Nullable
  @JsonProperty("middleName")
  public abstract String middleName();

  @Nullable
  @JsonProperty("lastName")
  public abstract String lastName();

  @Nullable
  @JsonProperty("suffix")
  public abstract String suffix();

  @Nullable
  @JsonProperty("email")
  public abstract String email();

  @Nullable
  @JsonProperty("phoneNumber")
  public abstract String phoneNumber();

  @Nullable
  @JsonProperty("dateJoined")
  @JsonFormat(pattern="MM-dd-yyyy")
  public abstract Calendar dateJoined();

  // Roles
  @Nullable
  @JsonProperty("isAdmin")
  public abstract Boolean isAdmin();

  @Nullable
  @JsonProperty("isCoreographer")
  public abstract Boolean isCoreographer();

  @Nullable
  @JsonProperty("isDancer")
  public abstract Boolean isDancer();

  @Nullable
  @JsonProperty("isOther")
  public abstract Boolean isOther();

  //Permissions
  @Nullable
  @JsonProperty("canLogin")
  public abstract Boolean canLogin();

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

    @JsonProperty("middleName")
    public abstract Builder setMiddleName(String middleName);

    @JsonProperty("lastName")
    public abstract Builder setLastName(String lastName);

    @JsonProperty("suffix")
    public abstract Builder setSuffix(String suffix);

    @JsonProperty("email")
    public abstract Builder setEmail(String email);

    @JsonProperty("phoneNumber")
    public abstract Builder setPhoneNumber(String phoneNumber);

    @JsonProperty("dateJoined")
    @JsonFormat(pattern="MM-dd-yyyy")
    public abstract Builder setDateJoined(Calendar dateJoined);

    // Roles
    @JsonProperty("isAdmin")
    public abstract Builder setIsAdmin(Boolean isAdmin);

    @JsonProperty("isCoreographer")
    public abstract Builder setIsCoreographer(Boolean isCoreographer);

    @JsonProperty("isDancer")
    public abstract Builder setIsDancer(Boolean isDancer);

    @JsonProperty("isOther")
    public abstract Builder setIsOther(Boolean isOther);

    // Permissions
    @JsonProperty("canLogin")
    public abstract Builder setCanLogin(Boolean canLogin);

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

    @JsonProperty("emergencyContcatName")
    public abstract Builder setEmergencyContactName(String emergencyContcatName);

    @JsonProperty("emergencyContactName")
    public abstract Builder setEmergencyContactNumber(String emergencyContactNumber);

    @JsonProperty("comments")
    public abstract Builder setComments(String comments);

    @JsonProperty("isActive")
    public abstract Builder setIsActive(Boolean isActive);

    public abstract UserInfo build();
  }
}
