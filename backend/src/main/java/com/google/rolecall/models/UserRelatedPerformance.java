package com.google.rolecall.models;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity(name = "UserRelatedPerformance")
@Table(name = "PerformanceCastMember")
public class UserRelatedPerformance {

  @Id
  private Integer id;

  @ManyToOne(optional = false)
  private User user;

  @ManyToOne(optional = false)
  private TruncatedPerformance performance;

  public Integer getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public TruncatedPerformance getPerformance() {
    return performance;
  }

  public UserRelatedPerformance() {
  }
}
