package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table
public class CastMember {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(name = "orderOf", nullable = false)
  private Integer order;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private SubCast cast;

  @Transient
  private boolean hasAbsence;

  
  public Integer getId() {
    return id;
  }

  public User getUser() {
    return user;
  }
  
  public boolean getHasAbsence() {
    return hasAbsence;
  }

  public Integer getOrder() {
    return order;
  }

  public SubCast getSubCast() {
    return cast;
  }

  public void setHasAbsence( boolean hasAbsence) {
    this.hasAbsence = hasAbsence; 
  }

  public CastMemberInfo toCastMemberInfo() {
    return CastMemberInfo.newBuilder()
        .setId(id)
        .setUserId(user.getId())
        .setSubCastId(cast.getId())
        .setOrder(order)
        .setDelete(null)
        .setHasAbsence(getHasAbsence())
        .build();
  }

  public void setOrder(Integer order) {
    if (order != null) {
      this.order = order;
    }
  }

  void setSubCast(SubCast cast) {
    this.cast = cast;
  }

  public CastMember(User user, Integer order) throws InvalidParameterException {
    if(user == null || order == null) {
      throw new InvalidParameterException("Cast Member requires existing User Order and Cast.");
    }

    this.user = user;
    this.order = order;
  }

  public CastMember() {
  }
}
