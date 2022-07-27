package com.google.rolecall.models;
import com.google.rolecall.Constants;
import com.google.rolecall.Constants.UnavailabilityReasons;

import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.google.rolecall.jsonobjects.UnavailabilityInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

@Entity
@Table
public class Unavailability {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User user;

  @Column(nullable = false)
  private Date startDate;

  @Column(nullable = false)
  private Date endDate;

  @Column(nullable = false)
  private String reason;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false)
  private Boolean status;

  public Integer getId() {
    return id;
  }

  public Boolean getStatus(){
    return status;
  }

  public String getReason(){
    return reason;
  }

  public String getDescription() {
    return description;
  }

  public User getUser() {
    return user;
  }

  public Date getStartDate() {
    return startDate;
  }

  public Date getEndDate() {
    return endDate;
  }

  void setUser(User user) {
    this.user = user;
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public UnavailabilityInfo toUnavailabilityInfo() {
    return UnavailabilityInfo.newBuilder()
        .setId(getId())
        .setUserId(getUser().getId())
        .setDescription(getDescription())
        .setStatus(getStatus())
        .setReason(getReason())
        .setStartDate(getStartDate().getTime())
        .setEndDate(getEndDate().getTime())
        
        .build();
  }

  public Unavailability() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private Unavailability unavailabile;
    private String reason;
    private String description;
    private Date startDate;
    private Date endDate;
    private Boolean status;


    public Builder setDescription(String description) {
      if(description != null) {
        this.description = description;
      }

      return this;
    }

    public Builder setReason(String reason) {
      if(reason != null) {
        this.reason = reason;
      }

      return this;
    }

    public Builder setStatus(Boolean status) {
      if(status != null) {
        this.status = status;
      }

      return this;
    }

    public Builder setStartDate(Long dateTimeMilis) {
      if(dateTimeMilis != null) {
        this.startDate = new Date(dateTimeMilis);
      }

      return this;
    }

    public Builder setEndDate(Long dateTimeMilis) {
      if(dateTimeMilis != null) {
        this.endDate = new Date(dateTimeMilis);
      }

      return this;
    }

    

    public Unavailability build() throws InvalidParameterException {
      if(startDate == null || endDate == null ) {
        throw new InvalidParameterException("Unavailability must have start and end date.");
      }

      unavailabile.description = this.description;
      unavailabile.endDate = this.endDate;
      unavailabile.startDate = this.startDate;
      unavailabile.reason = this.reason;
      unavailabile.status = this.status;
      return unavailabile;
    }

    public Builder(Unavailability unavailable) {
      this.unavailabile = unavailable;
      this.description = unavailable.getDescription();
      this.startDate = unavailable.getStartDate();
      this.endDate = unavailable.getEndDate();
      this.status = unavailable.getStatus();
      this.reason = unavailable.getReason();
    }

    public Builder() {
      this.unavailabile = new Unavailability();
      this.reason = UnavailabilityReasons.UNDEF;
      this.description = "";
    }
  }
}
