package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.SubCastInfo;
import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
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
  private List<CastMember> members = new ArrayList<>();

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

  public List<CastMember> getCastMembers() {
    return members;
  }

  public void addCastMember(CastMember member) throws InvalidParameterException {
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

  public SubCast(int castNumber) {
    this.castNumber = castNumber;
  }

  public SubCast() {
  }
}
