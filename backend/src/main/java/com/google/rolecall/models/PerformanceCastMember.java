package com.google.rolecall.models;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table
public class PerformanceCastMember {
  
  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private Integer castNumber;

  @Column(name = "orderOf", nullable = false)
  private Integer order;

  @Column(nullable = false)
  private Boolean performing;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Performance performance;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private PerformanceSection performanceSection;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Position position;

  public Integer getId() {
    return id;
  }

  public Integer getCastNumber() {
    return castNumber;
  }

  public Boolean isPerforming() {
    return performing;
  }

  public Integer getOrder() {
    return order;
  }

  public User getUser() {
    return user;
  }

  public Performance getPerformance() {
    return performance;
  }

  public PerformanceSection getPerformanceSection() {
    return performanceSection;
  }

  public Position getPosition() {
    return position;
  }

  void setUser(User user) {
    this.user = user;
  }

  void setPerformance(Performance performance) {
    this.performance = performance;
  }

  void setPerformanceSection(PerformanceSection performanceSection) {
    this.performanceSection = performanceSection;
  }

  void setPosition(Position position) {
    this.position = position;
  }

}