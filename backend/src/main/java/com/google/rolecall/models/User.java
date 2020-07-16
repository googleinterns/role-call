package com.google.rolecall.models;

import java.time.LocalDate;
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

  @Column(nullable = false)
  private String lastName;

  @NaturalId
  @Column(nullable = false, unique = true)
  private String email;

  @Basic
  @Temporal(TemporalType.DATE)
  private LocalDate dateOfBirth;

  @Basic
  private String emergencyContactName;

  @Basic
  private String emergencyContactNumber;

  @Basic
  private String comments;

  @Column(nullable = false)
  private Boolean isActive;

  // TODO: Add in Role after it is created

  private int loginCount = 0;

  public Integer getId() {
    return id;
  }

  public String getFirstName() {
    return firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public String getEmail() {
    return email;
  }

  public int getLoginCount() {
    return loginCount;
  }

  public Optional<LocalDate> getDateOfBirth() {
    return dateOfBirth == null ? Optional.empty(): Optional.of(dateOfBirth);
  }

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

  public void setFirstName(String name) {
    this.firstName = name;
  }

  public void setLastName(String name) {
    this.lastName = name;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setDateOfBirth(LocalDate dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  public void setEmergencyContactName(String emergencyContactName) {
    this.emergencyContactName = emergencyContactName;
  }

  public void setEmergencyContactNumber(String emergencyContactNumber) {
    this.emergencyContactNumber = emergencyContactNumber;
  }

  public void setComments(String comments) {
    this.comments = comments;
  }

  public void setIsActive(boolean isActive) {
    this.isActive = isActive;
  }

  public void incrementLogin() {
    loginCount++;
  }

  public User(String firstName, String lastName, String email, LocalDate dateOfBirth,
      String emergencyContactName, String emergencyContactNumber, String comments,
      boolean isActive) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.dateOfBirth = dateOfBirth;
    this.emergencyContactName = emergencyContactName;
    this.emergencyContactNumber = emergencyContactNumber;
    this.comments = comments;
    this.isActive = isActive;
  }

  // Required for spring reflective CRUD Repository call
  public User() {
  }
}
