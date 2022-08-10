package com.google.rolecall.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.UserInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.hibernate.annotations.NaturalId;

/* Basic user information. */
@Entity
@Table
public class User {
  
  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private String firstName;

  @Basic
  private String middleName;

  @Column(nullable = false)
  private String lastName;

  @Basic
  private String suffix;

  @NaturalId
  @Column(nullable = false, unique = true)
  private String email;

  @Basic
  private String notificationEmail;

  @Basic
  private String pictureFile;

  @Basic
  private String phoneNumber;

  @Basic
  @Temporal(TemporalType.DATE)
  @JsonFormat(pattern="yyyy-MM-dd")
  private Calendar dateJoined;

  // Roles with defaults
  @Column(nullable = false)
  private boolean isAdmin = false;
  @Column(nullable = false)
  private boolean isChoreographer = false;
  @Column(nullable = false)
  private boolean isDancer = false;
  @Column(nullable = false)
  private boolean isOther = false;

  // Permissions with defaults
  @Column(nullable = false)
  private boolean canLogin = true;
  @Column(nullable = false)
  private boolean notifications = true;
  @Column(nullable = false)
  private boolean managePerformances = false;
  @Column(nullable = false)
  private boolean manageCasts = false;
  @Column(nullable = false)
  private boolean managePieces = false;
  @Column(nullable = false)
  private boolean manageRoles = false;
  @Column(nullable = false)
  private boolean manageRules = false;

  // Trailer
  @Basic
  private String emergencyContactName;

  @Basic
  private String emergencyContactNumber;

  @Basic
  private String comments;

  @Column(nullable = false)
  private boolean isActive;

  public Integer getId() {
    return id;
  }

  public String getFirstName() {
    return firstName;
  }

  public String getMiddleName() {
    return middleName;
  }

  public String getLastName() {
    return lastName;
  }

  public String getSuffix() {
    return suffix;
  }

  public String getEmail() {
    return email;
  }

  public String getNotificationEmail() {
    return notificationEmail;
  }

  public String getPictureFile() {
    return pictureFile;
  }

  public String getPhoneNumber() {
    return phoneNumber == null ? "" : phoneNumber;
  }

  public Optional<Calendar> getDateJoined() {
    return dateJoined == null ? Optional.empty(): Optional.of(dateJoined);
  }

  // Roles
  public boolean isAdmin() {
    return isAdmin;
  }

  public boolean isChoreographer() {
    return isChoreographer;
  }

  public boolean isDancer() {
    return isDancer;
  }

  public boolean isOther() {
    return isOther;
  }

  // Permissions
  public boolean canLogin() {
    return canLogin;
  }

  public boolean recievesNotifications() {
    return notifications;
  }
  
  public boolean canManagePerformances() {
    return managePerformances;
  }
  
  public boolean canManageCasts() {
    return manageCasts;
  }
  
  public boolean canManagePieces() {
    return managePieces;
  }
  
  public boolean canManageRoles() {
    return manageRoles;
  }
  
  public boolean canManageRules() {
    return manageRules;
  }

  // Trailer
  public String getEmergencyContactName() {
    return emergencyContactName == null ? "" : emergencyContactName;
  }

  public String getEmergencyContactNumber() {
    return emergencyContactNumber == null ? "" : emergencyContactNumber;
  }

  public String getComments() {
    return comments == null ? "" : comments;
  }

  public boolean isActive() {
    return isActive;
  }

  public void addPerformanceCastMember(PerformanceCastMember member) {
    member.setUser(this);
  }

  public void removePerformanceCastMember(PerformanceCastMember member) {
    member.setUser(null);
  }

  public void addUnavailability(Unavailability unavailable) {
    unavailable.setUser(this);
  }

  public void removeUnavailability(Unavailability unavailable) {
    unavailable.setUser(null);
  }

  public String[] getRoles() {
    List<Boolean> roleIn = new ArrayList<>();
    roleIn.add(isAdmin()); // ADMIN
    roleIn.add(isChoreographer()); // CHOREOGRAPHER
    roleIn.add(isDancer()); // DANCER
    roleIn.add(isOther()); // OTHER

    ArrayList<String> rolesOut = new ArrayList<>();
    for(int i = 0; i < Constants.Roles.ROLES.length; i++) {
      if (roleIn.get(i)) {
        rolesOut.add(Constants.Roles.ROLES[i]);
      }
    }
    String[] out = new String[rolesOut.size()];
    return rolesOut.toArray(out);
  }

  public String[] getPermissions() {
    List<Boolean> permissionsIn = new ArrayList<>();
    permissionsIn.add(isAdmin() || canLogin()); // LOGIN
    permissionsIn.add(recievesNotifications()); // NOTIFICATIONS
    permissionsIn.add(isAdmin() || canManagePerformances()); // MANGAGE_PERFORMANCES
    permissionsIn.add(isAdmin() || canManageCasts()); // MANAGE_CASTS
    permissionsIn.add(isAdmin() || canManagePieces()); // MANAGE_BALLETS
    permissionsIn.add(isAdmin() || canManageRoles()); // MANAGE_ROLES
    permissionsIn.add(isAdmin() || canManageRules()); // MANAGE_RULES

    ArrayList<String> permissionsOut = new ArrayList<>();
    for(int i = 0; i < Constants.Roles.ROLES.length; i++) {
      if (permissionsIn.get(i)) {
        permissionsOut.add(Constants.Roles.ROLES[i]);
      }
    }
    String[] out = new String[permissionsOut.size()];
    return permissionsOut.toArray(out);
  }

  public UserInfo toUserInfo() {
    return UserInfo.newBuilder()
        .setId(id)
        .setFirstName(firstName)
        .setMiddleName(middleName)
        .setLastName(lastName)
        .setSuffix(suffix)
        .setEmail(email)
        .setNotificationEmail(notificationEmail)
        .setPictureFile(pictureFile)
        .setPhoneNumber(phoneNumber)
        .setDateJoined(dateJoined)
        .setIsAdmin(isAdmin)
        .setIsChoreographer(isChoreographer)
        .setIsDancer(isDancer)
        .setIsOther(isOther)
        .setCanLogin(canLogin)
        .setNotifications(notifications)
        .setManagePerformances(managePerformances)
        .setManageCasts(manageCasts)
        .setManagePieces(managePieces)
        .setManageRoles(manageRoles)
        .setManageRules(manageRules)
        .setEmergencyContactName(getEmergencyContactName())
        .setEmergencyContactNumber(getEmergencyContactNumber())
        .setComments(getComments())
        .setIsActive(isActive)
        .build();
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  // Required for spring reflective CRUD Repository call
  public User() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private User user;
    private Integer id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String suffix;
    private String email;
    private String notificationEmail;
    private String pictureFile;
    private String phoneNumber;
    private Calendar dateJoined;
    private Boolean isAdmin = false;
    private Boolean isChoreographer = false;
    private Boolean isDancer = false;
    private Boolean isOther = false;
    private Boolean canLogin = false;
    private Boolean notifications = true;
    private Boolean managePerformances = false;
    private Boolean manageCasts = false;
    private Boolean managePieces = false;
    private Boolean manageRoles = false;
    private Boolean manageRules = false;
    private String emergencyContactName;
    private String emergencyContactNumber;
    private String comments;
    private Boolean isActive = true;

    public Builder setFirstName(String name) {
      if(name != null) {
        this.firstName = name;
      }
      return this;
    }

    public Builder setMiddleName(String name) {
      if(name != null) {
        this.middleName = name;
      }
      return this;
    }
  
    public Builder setLastName(String name) {
      if(name != null) {
        this.lastName = name;
      }
      return this;
    }

    public Builder setSuffix(String suffix) {
      if(suffix != null) {
        this.suffix = suffix;
      }
      return this;
    }
  
    public Builder setEmail(String email) {
      if(email != null) {
        this.email = email.toLowerCase();
      }
      return this;
    }
  
    public Builder setNotificationEmail(String notificationEmail) {
      if(notificationEmail != null) {
        this.notificationEmail = notificationEmail.toLowerCase();
      }
      return this;
    }
  
    public Builder setPictureFile(String pictureFile) {
      if(pictureFile != null) {
        this.pictureFile = pictureFile;
      }
      return this;
    }
  
    public Builder setPhoneNumber(String phoneNumber) {
      if(phoneNumber != null) {
        this.phoneNumber = phoneNumber;
      }
      return this;
    }

    public Builder setDateJoined(Calendar dateJoined) {
      if(dateJoined != null) {
        this.dateJoined = dateJoined;
      }
      return this;
    }
  
    public Builder setIsAdmin(Boolean isAdmin) {
      if(isAdmin != null) {
        this.isAdmin = isAdmin;
      }
      return this;
    }
  
    public Builder setIsChoreographer(Boolean isChoreographer) {
      if(isChoreographer != null) {
        this.isChoreographer = isChoreographer;
      }
      return this;
    }
  
    public Builder setIsDancer(Boolean isDancer) {
      if(isDancer != null) {
        this.isDancer = isDancer;
      }
      return this;
    }
  
    public Builder setIsOther(Boolean isOther) {
      if(isOther != null) {
        this.isOther = isOther;
      }
      return this;
    }
  
    public Builder setCanLogin(Boolean canLogin) {
      if(canLogin != null) {
        this.canLogin = canLogin;
      }
      return this;
    }

    public Builder setRecievesNotifications(Boolean notifications) {
      if(notifications != null) {
        this.notifications = notifications;
      }
      return this;
    }
    
    public Builder setManagePerformances(Boolean managePerformances) {
      if(managePerformances != null) {
        this.managePerformances = managePerformances;
      }
      return this;
    }
    
    public Builder setManageCasts(Boolean manageCasts) {
      if(manageCasts != null) {
        this.manageCasts = manageCasts;
      }
      return this;
    }
    
    public Builder setManagePieces(Boolean managePieces) {
      if(managePieces != null) {
        this.managePieces = managePieces;
      }
      return this;
    }
    
    public Builder setManageRoles(Boolean manageRoles) {
      if(manageRoles != null) {
        this.manageRoles = manageRoles;
      }
      return this;
    }
    
    public Builder setManageRules(Boolean manageRules) {
      if(manageRules != null) {
        this.manageRules = manageRules;
      }
      return this;
    }
  
    public Builder setEmergencyContactName(String emergencyContactName) {
      if(emergencyContactName != null) {
        this.emergencyContactName = emergencyContactName;
      }
      return this;
    }
  
    public Builder setEmergencyContactNumber(String emergencyContactNumber) {
      if(emergencyContactNumber != null) {
        this.emergencyContactNumber = emergencyContactNumber;
      }
      return this;
    }
  
    public Builder setComments(String comments) {
      if(comments != null) {
        this.comments = comments;
      }
      return this;
    }

    public Builder setIsActive(Boolean isActive) {
      if(isActive != null) {
        this.isActive = isActive;
      }
      return this;
    }

    public User build() throws InvalidParameterException {
      if(firstName == null || lastName == null || email == null) {
        throw new InvalidParameterException(
            "User must have non-null firstName, lastName, and email");
      }
      user.id = this.id;
      user.firstName = this.firstName;
      user.middleName = this.middleName;
      user.lastName = this.lastName;
      user.suffix = this.suffix;
      user.email = this.email;
      user.notificationEmail = this.notificationEmail;
      user.pictureFile = this.pictureFile;
      user.phoneNumber = this.phoneNumber;
      user.dateJoined = this.dateJoined;
      user.isAdmin = this.isAdmin;
      user.isChoreographer = this.isChoreographer;
      user.isDancer = this.isDancer;
      user.isOther = this.isOther;
      user.canLogin = this.canLogin;
      user.notifications = this.notifications;
      user.managePerformances = this.managePerformances;
      user.manageCasts = this.manageCasts;
      user.managePieces = this.managePieces;
      user.manageRoles = this.manageRoles;
      user.manageRules = this.manageRules;
      user.emergencyContactName = this.emergencyContactName;
      user.emergencyContactNumber = this.emergencyContactNumber;
      user.comments = this.comments;
      user.isActive = this.isActive;
      return user;
    }

    public Builder(User user) {
      this.user = user;
      this.id = user.id;
      this.firstName = user.firstName;
      this.middleName = user.middleName;
      this.lastName = user.lastName;
      this.suffix = user.suffix;
      this.email = user.email;
      this.notificationEmail = user.notificationEmail;
      this.pictureFile = user.pictureFile;
      this.phoneNumber = user.phoneNumber;
      this.dateJoined = user.dateJoined;
      this.isAdmin = user.isAdmin;
      this.isChoreographer = user.isChoreographer;
      this.isDancer = user.isDancer;
      this.isOther = user.isOther;
      this.canLogin = user.canLogin;
      this.notifications = user.notifications;
      this.managePerformances = user.managePerformances;
      this.manageCasts = user.manageCasts;
      this.managePieces = user.managePieces;
      this.manageRoles = user.manageRoles;
      this.manageRules = user.manageRules;
      this.emergencyContactName = user.emergencyContactName;
      this.emergencyContactNumber = user.emergencyContactNumber;
      this.comments = user.comments;
      this.isActive = user.isActive;
    }

    public Builder() {
      user = new User();
    }
  }
}
