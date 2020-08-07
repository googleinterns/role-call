package com.google.rolecall.models;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

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

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Section section;

  public Integer getId() {
    return id;
  }

  public Integer getSectionPosition() {
    return sectionPosition;
  }

  public Integer getPrimaryCast() {
    return primaryCast == null ? 0 : primaryCast;
  }

  public Performance getPerformance() {
    return performance;
  }

  public Section getSection() {
    return section;
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