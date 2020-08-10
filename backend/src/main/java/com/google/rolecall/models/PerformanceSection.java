package com.google.rolecall.models;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;

import javax.persistence.Basic;
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

import com.google.rolecall.jsonobjects.PerformanceCastInfo;
import com.google.rolecall.jsonobjects.PerformanceCastMemberInfo;
import com.google.rolecall.jsonobjects.PerformancePositionInfo;
import com.google.rolecall.jsonobjects.PerformanceSectionInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

@Entity
@Table
public class PerformanceSection {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private Integer sectionPosition;

  @Basic
  private Integer primaryCast;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Performance performance;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Section section;

  @OneToMany(mappedBy = "performanceSection", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true, 
      fetch = FetchType.EAGER)
  private List<PerformanceCastMember> performanceCastMembers = new ArrayList<>();

  public Integer getId() {
    return id;
  }

  public int getSectionPosition() {
    return sectionPosition;
  }

  public int getPrimaryCast() {
    return primaryCast == null ? 0 : primaryCast;
  }

  public Performance getPerformance() {
    return performance;
  }

  public Section getSection() {
    return section;
  }

  public List<PerformanceCastMember> getPerformanceCastMembers() {
    return performanceCastMembers;
  }

  public void addPerformanceCastMember(PerformanceCastMember member) {
    member.setPerformanceSection(this);
    performanceCastMembers.add(member);
  }

  public void removePerformanceCastMember(PerformanceCastMember member) {
    member.setPerformance(null);
    performanceCastMembers.remove(member);
  }

  public PerformanceSectionInfo toPerformanceSectionInfo() {
    Hashtable<Position, Hashtable<Integer, List<PerformanceCastMemberInfo>>> positions = 
        new Hashtable<>();
    
    for(PerformanceCastMember member: performanceCastMembers) {
      Position position = member.getPosition();

      Hashtable<Integer, List<PerformanceCastMemberInfo>> cast;
      if(positions.containsKey(position)) {
        cast = positions.get(position);
      } else {
        cast = new Hashtable<>();
        positions.put(position, cast);
      }

      int castNumber = member.getCastNumber();
      List<PerformanceCastMemberInfo> members;
      if(cast.containsKey(castNumber)) {
        members = cast.get(castNumber);
      } else {
        members = new ArrayList<>();
        cast.put(castNumber, members);
      }

      members.add(member.toPerformanceCastMemberInfo());
    }

    List<PerformancePositionInfo> positionInfos = toAllPerformancePositionInfo(positions);

    return PerformanceSectionInfo.newBuilder()
        .setId(id)
        .setPrimaryCast(getPrimaryCast())
        .setSectionId(section.getId())
        .setSectionPosition(getSectionPosition())
        .setPositions(positionInfos)
        .build();
  }

  private List<PerformancePositionInfo> toAllPerformancePositionInfo(
      Hashtable<Position, Hashtable<Integer, List<PerformanceCastMemberInfo>>> positions) {
    List<PerformancePositionInfo> positionInfos = new ArrayList<>();

    for(Position position: positions.keySet()) {
      Hashtable<Integer, List<PerformanceCastMemberInfo>> casts = positions.get(position);
      
      List<PerformanceCastInfo> castInfos = new ArrayList<>();
      for(Integer castNumber: casts.keySet()) {
        PerformanceCastInfo castInfo = PerformanceCastInfo.newBuilder()
            .setCastNumber(castNumber)
            .setPerformanceCastMembers(casts.get(castNumber))
            .build();
        
        castInfos.add(castInfo);
      }
      
      PerformancePositionInfo positionInfo = PerformancePositionInfo.newBuilder()
          .setPositionId(position.getId())
          .setPerformanceCasts(castInfos)
          .build();

      positionInfos.add(positionInfo);
    }

    return positionInfos;
  }

  void setSection(Section section) {
    this.section = section;
  }

  void setPerformance(Performance performance) {
    this.performance = performance;
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public PerformanceSection() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private PerformanceSection performanceSection;
    private Integer sectionPosition;
    private Integer primaryCast;

    public Builder setSectionPosition(Integer sectionPosition) {
      if(sectionPosition != null) {
        this.sectionPosition = sectionPosition;
      }

      return this;
    }

    public Builder setPrimaryCast(Integer primaryCast) {
      if(primaryCast != null) {
        this.primaryCast = primaryCast;
      }

      return this;
    }

    public PerformanceSection build() throws InvalidParameterException {
      if(sectionPosition == null) {
        throw new InvalidParameterException("Section in Performance requires a position.");
      }

      performanceSection.sectionPosition = this.sectionPosition;
      performanceSection.primaryCast = this.primaryCast;

      return performanceSection;
    }

    public Builder(PerformanceSection performanceSection) {
      this.performanceSection = performanceSection;
      this.sectionPosition = performanceSection.getSectionPosition();
      this.primaryCast = performanceSection.getPrimaryCast();
    }

    public Builder() {
      this.performanceSection = new PerformanceSection();
    }
  }
}
