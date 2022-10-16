package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.PerformanceCastMemberInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
// import javax.persistence.Transient;

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

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Position position;

  // @Transient
  // private boolean hasAbsence;

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

  // public boolean getHasAbsence() {
  //   return hasAbsence;
  // }

  // public void setHasAbsence( boolean hasAbsence) {
  //   this.hasAbsence = hasAbsence; 
  // }

  public void setPerforming(boolean isPerforming) {
    this.performing = isPerforming;
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

  public PerformanceCastMemberInfo toPerformanceCastMemberInfo() {
    return PerformanceCastMemberInfo.newBuilder()
        .setId(id)
        .setOrder(order)
        .setPerforming(performing)
        .setUserId(user.getId())
        // .setHasAbsence(getHasAbsence())
        .build();
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public PerformanceCastMember() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private PerformanceCastMember member;
    private Integer castNumber;
    private Integer order;

    public Builder setCastNumber(Integer castNumber) {
      if(castNumber != null) {
        this.castNumber = castNumber;
      }

      return this;
    }

    public Builder setOrder(Integer order) {
      if(order != null) {
        this.order = order;
      }

      return this;
    }

    public PerformanceCastMember build() throws InvalidParameterException {
      if(order == null || castNumber == null) {
        throw new InvalidParameterException(
            "Cast Member in Performance requires a cast number and an order.");
      }

      member.castNumber = this.castNumber;
      member.order = this.order;

      return member;
    }

    public Builder(PerformanceCastMember member) {
      this.member = member;
      this.order = member.getOrder();
      this.castNumber = member.getCastNumber();
    }

    public Builder() {
      this.member = new PerformanceCastMember();
    }
  }
}
