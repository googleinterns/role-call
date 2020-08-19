package com.google.rolecall.models;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.models.Performance.Status;

@Entity(name = "TruncatedPerformance")
@Table(name = "Performance")
public class TruncatedPerformance {

  @Id
  private Integer id;

  @Column(nullable = false)
  private String title;

  @Column(length=1024)
  private String description;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String state;

  @Column(nullable = false)
  private String country;

  @Column(nullable = false)
  private String venue;

  @Column(nullable = false)
  private Timestamp dateTime;

  @Enumerated(EnumType.ORDINAL)
  private Status status;

  public Integer getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description == null ? "" : description;
  }

  public String getCity() {
    return city;
  }

  public String getState() {
    return state;
  }

  public String getCountry() {
    return country;
  }

  public String getVenue() {
    return venue;
  }

  public Timestamp getDate() {
    return dateTime;
  }

  public Status getStatus() {
    return status;
  }

  public PerformanceInfo toPerformanceInfo() {
    return PerformanceInfo.newBuilder()
        .setId(getId())
        .setTitle(getTitle())
        .setCity(getCity())
        .setCountry(getCountry())
        .setState(getState())
        .setVenue(getVenue())
        .setDescription(getDescription())
        .setDateTime(getDate().getTime())
        .setStatus(getStatus())
        .build();
  }

  public TruncatedPerformance() {
  }
}
