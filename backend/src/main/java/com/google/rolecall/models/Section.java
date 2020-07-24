package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.PositionInfo;
import com.google.rolecall.jsonobjects.SectionInfo;
import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

/* Represents a general Section of a Performance*/
@Entity
@Table
public class Section {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private String name;

  @Basic
  private String notes;

  @Basic
  private Integer length;

  // TODO: Change Fetch type by implementing lazy fetching
  @OneToMany(mappedBy = "section", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true, 
      fetch = FetchType.EAGER)
  private List<Position> positions = new ArrayList<>();

  public Integer getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getNotes() {
    return notes == null ? "" : notes;
  }

  public Optional<Integer> getLength() {
    return length == null ? Optional.empty() : Optional.of(length);
  }

  public List<Position> getPositions() {
    return positions;
  }

  public SectionInfo toSectionInfo() {
    List<PositionInfo> positionInfos = positions.stream().map(p ->
        PositionInfo.newBuilder()
            .setId(p.getId())
            .setName(p.getName())
            .setNotes(p.getNotes())
            .setOrder(p.getOrder())
            .build()
        ).collect(Collectors.toList());
    
    SectionInfo section = SectionInfo.newBuilder()
        .setId(id)
        .setName(name)
        .setNotes(getNotes())
        .setLength(length)
        .setPositions(positionInfos)
        .build();

    return section;
  }

  public void addPosition(Position position) {
    if(position.getSection() == null) {
      positions.add(position);
      position.setSection(this);
    }
    // Throw exception here because was trying to add
  }

  public void removePosition(Position position) {
    positions.remove(position);
    position.setSection(null);
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  @Override
  public boolean equals(Object object) {
    if(!(object instanceof Section)) {
      return false;
    }

    Section section = (Section) object;
    if(this.id == null || section.id == null) {
      return false;
    }

    return this.id.equals(section.id);
  }

  public Section() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private Section section;
    private Integer id;
    private String name;
    private String notes;
    private Integer length;

    public Builder setName(String name) {
      if(name != null) {
        this.name = name;
      }
      return this;
    }

    public Builder setNotes(String notes) {
      if(notes != null) {
        this.notes = notes;
      }
      return this;
    }

    public Builder setLength(Integer length) {
      if(length != null) {
        this.length = length;
      }
      return this;
    }

    public Section build() {
      if(this.name == null) {
        throw new InvalidParameterException("Section requires a name");
      }
      section.id = this.id;
      section.name = this.name;
      section.notes = this.notes;
      section.length = this.length;

      return section;
    }

    public Builder(Section section) {
      this.section = section;
      this.id = section.id;
      this.name = section.name;
      this.notes = section.notes;
      this.length = section.length;
    }

    public Builder() {
      this.section = new Section();
    }
  } 
}
