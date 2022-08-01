package com.google.rolecall.models;

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
import com.google.rolecall.Constants;

@Entity
@Table
public class Unavailability {

  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private Integer id;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User user;

  @Column(nullable = false)
  private String reason;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false)
  private Date startDate;

  @Column(nullable = false)
  private Date endDate;

  public Integer getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public String getReason() {
    return reason;
  }

  public String getDescription() {
    return description;
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
        .setReason(getReason())
        .setDescription(getDescription())
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

    public Builder setReason(String reason) {
      if(reason != null) {
        this.reason = reason;
      }

      return this;
    }

    public Builder setDescription(String description) {
      if(description != null) {
        this.description = description;
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

      unavailabile.reason = this.reason;
      unavailabile.description = this.description;
      unavailabile.endDate = this.endDate;
      unavailabile.startDate = this.startDate;

      return unavailabile;
    }

    public Builder(Unavailability unavailable) {
      this.unavailabile = unavailable;
      this.reason = unavailable.getReason();
      this.description = unavailable.getDescription();
      this.startDate = unavailable.getStartDate();
      this.endDate = unavailable.getEndDate();
    }

    public Builder() {
      this.unavailabile = new Unavailability();
      this.reason = Constants.UnavailabilityReasons.UNDEF;
      this.description = "";
    }
  }
}
