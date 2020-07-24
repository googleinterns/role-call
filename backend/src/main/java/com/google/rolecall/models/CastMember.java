package com.google.rolecall.models;

import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table
public class CastMember {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Cast cast;

  public Integer getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public Cast getCast() {
    return cast;
  }

  void setCast(Cast cast) {
    this.cast = cast;
  }

  CastMember(User user, Cast cast) throws InvalidParameterException {
    if(user == null || cast == null) {
      throw new InvalidParameterException("Cast Member requires existing User and Cast.");
    }

    this.user = user;
    this.cast = cast;
  }

  public CastMember() {
  }
}
