package com.google.rolecall.jsonobjects;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.google.auto.value.AutoValue;
import java.util.Calendar;
import javax.annotation.Nullable;

@AutoValue
public abstract class UserInfo {
  @Nullable
  public abstract Integer id();

  @Nullable
  public abstract String firstName();

  @Nullable
  public abstract String lastName();

  @Nullable
  public abstract String email();

  @Nullable
  @JsonFormat(pattern="MM-dd-yyyy")
  public abstract Calendar dateJoined();

  @Nullable
  public abstract String emergencyContactName();

  @Nullable
  public abstract String emergencyContactNumber();

  @Nullable
  public abstract String comments();

  @Nullable
  public abstract Boolean isActive();

  @Nullable
  public abstract Boolean canLogin();

  @Nullable
  public abstract Boolean admin();

  @Nullable
  public abstract Boolean notifications();

  @Nullable
  public abstract Boolean managePerformances();

  @Nullable
  public abstract Boolean manageCasts();

  @Nullable
  public abstract Boolean managePieces();

  @Nullable
  public abstract Boolean manageRoles();

  @Nullable
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
    public abstract Builder setId(Integer id);

    public abstract Builder setFirstName(String firstName);

    public abstract Builder setLastName(String lastName);

    public abstract Builder setEmail(String email);

    public abstract Builder setDateJoined(Calendar dateJoined);

    public abstract Builder setEmergencyContactName(String emergencyContcatName);

    public abstract Builder setEmergencyContactNumber(String emergencyContactNumber);

    public abstract Builder setComments(String comments);

    public abstract Builder setIsActive(Boolean isActive);

    public abstract Builder setCanLogin(Boolean canLogin);

    public abstract Builder setAdmin(Boolean admin);

    public abstract Builder setNotifications(Boolean notifications);

    public abstract Builder setManagePerformances(Boolean managePerformances);

    public abstract Builder setManageCasts(Boolean manageCasts);

    public abstract Builder setManagePieces(Boolean managePieces);

    public abstract Builder setManageRoles(Boolean manageRoles);
    
    public abstract Builder setManageRules(Boolean manageRules);

    public abstract UserInfo build();
  }
}
