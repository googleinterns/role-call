package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.SubCastInfo;
import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table
public class SubCast {
  
  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private Integer castNumber;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Cast cast;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Position position;

  @OneToMany(mappedBy = "cast", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  private Set<CastMember> members = new HashSet<>();

  public Integer getId() {
    return id;
  }

  public Integer getcastNumber() {
    return castNumber;
  }

  public Cast getCast() {
    return cast;
  }

  public Position getPosition() {
    return position;
  }

  public Set<CastMember> getCastMembers() {
    return members;
  }

  public void addCastMember(CastMember member) throws InvalidParameterException {
    if(member.getSubCast() != null) {
      member.getSubCast().removeCastMember(member);
    }
    member.setSubCast(this);
    members.add(member);
  }

  public void removeCastMember(CastMember member) {
    member.setSubCast(null);
    members.remove(member);
  }

  void setPosition(Position position) {
    this.position = position;
  }

  void setCast(Cast cast) {
    this.cast = cast;
  }

  public SubCastInfo toSubCastInfo() {
    List<CastMemberInfo> membersInfo = members.stream().map(c->c.toCastMemberInfo())
        .collect(Collectors.toList());
  
    return SubCastInfo.newBuilder()
        .setId(id)
        .setCastNumber(castNumber)
        .setPositionId(position.getId())
        .setMembers(membersInfo)
        .build();
  }

  /* Searches for and returns a CastMember from members based on id. */
  public CastMember getCastMemberById(Integer id)
      throws InvalidParameterException, EntityNotFoundException {
    if(id == null) {
      throw new InvalidParameterException("SubCastId cannot be null");
    }

    for (CastMember member : members) {
      if(member.getId().equals(id)) {
        return member;
      }
    }

    throw new EntityNotFoundException(String.format(
        "Cast Member with id %d does not exist for this Sub Cast", id));
  }

  public SubCast(Integer castNumber) throws InvalidParameterException {
    if(castNumber == null) {
      throw new InvalidParameterException("SubCast requires cast number.");
    }
    this.castNumber = castNumber;
  }

  public SubCast() {
  }
}
