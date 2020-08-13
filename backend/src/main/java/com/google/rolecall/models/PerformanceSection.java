package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.PerformanceCastInfo;
import com.google.rolecall.jsonobjects.PerformanceCastMemberInfo;
import com.google.rolecall.jsonobjects.PerformancePositionInfo;
import com.google.rolecall.jsonobjects.PerformanceSectionInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Set;
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
  private Set<PerformanceCastMember> performanceCastMembers = new HashSet<>();

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
    return new ArrayList<>(performanceCastMembers);
  }

  public void addPerformanceCastMember(PerformanceCastMember member) {
    member.setPerformanceSection(this);
    performanceCastMembers.add(member);
  }

  public void removePerformanceCastMember(PerformanceCastMember member) {
    member.setPerformanceSection(null);
    performanceCastMembers.remove(member);
  }

  public PerformanceCastMember getPerformanceCastMemberById(Integer id)
      throws EntityNotFoundException, InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("PerformanceCastMemberId cannot be null");
    }

    for (PerformanceCastMember member : performanceCastMembers) {
      if((int) member.getId() == (int) id) {
        return member;
      }
    }

    throw new EntityNotFoundException(String.format(
        "PerformanceCastMember with id %d does not exist for this Performance", id));
  }

  public PerformanceSectionInfo toPerformanceSectionInfo() {
    Hashtable<Integer, Hashtable<Integer, List<PerformanceCastMemberInfo>>> positions = 
        new Hashtable<>();
    
    for(PerformanceCastMember member: performanceCastMembers) {
      Integer positionId = member.getPosition().getId();

      Hashtable<Integer, List<PerformanceCastMemberInfo>> cast;
      if(positions.containsKey(positionId)) {
        cast = positions.get(positionId);
      } else {
        cast = new Hashtable<>();
        positions.put(positionId, cast);
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
      Hashtable<Integer, Hashtable<Integer, List<PerformanceCastMemberInfo>>> positions) {
    List<PerformancePositionInfo> positionInfos = new ArrayList<>();

    for(Integer positionId: positions.keySet()) {
      Hashtable<Integer, List<PerformanceCastMemberInfo>> casts = positions.get(positionId);
      
      List<PerformanceCastInfo> castInfos = new ArrayList<>();
      for(Integer castNumber: casts.keySet()) {
        PerformanceCastInfo castInfo = PerformanceCastInfo.newBuilder()
            .setCastNumber(castNumber)
            .setPerformanceCastMembers(casts.get(castNumber))
            .build();
        
        castInfos.add(castInfo);
      }
      
      PerformancePositionInfo positionInfo = PerformancePositionInfo.newBuilder()
          .setPositionId(positionId)
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
