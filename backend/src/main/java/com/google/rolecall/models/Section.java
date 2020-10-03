package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.PositionInfo;
import com.google.rolecall.jsonobjects.SectionInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.persistence.Basic;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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

  public enum Type {
    PIECE,
    SEGMENT,
    SUPER,
  }

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Basic
  private Boolean isOpen;

  @Column(nullable = false)
  private String name;

  @Basic
  private String notes;

  @Basic
  private Integer length;

  @Basic
  private Integer siblingId;

  @Enumerated(EnumType.ORDINAL)
  private Type type;

  @OneToMany(mappedBy = "section", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true, 
      fetch = FetchType.EAGER)
  private List<Position> positions = new ArrayList<>();

  @OneToMany(mappedBy = "section", 
    cascade = CascadeType.REMOVE, 
    orphanRemoval = true, 
    fetch = FetchType.LAZY)
  private List<Cast> casts = new ArrayList<>();

  public Integer getId() {
    return id;
  }

  public Boolean getIsOpen() {
    return isOpen;
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

  public Integer getSiblingId() {
    return siblingId;
  }

  public Type getType() {
    return type;
  }

  public List<Position> getPositions() {
    return positions;
  }

  public List<Cast> getCasts() {
    return casts;
  }

  public SectionInfo toSectionInfo() {
    List<PositionInfo> positionInfos = positions.stream().map(p ->
        p.toPositionInfo()).collect(Collectors.toList());
    
    SectionInfo section = SectionInfo.newBuilder()
        .setId(id)
        .setName(name)
        .setNotes(getNotes())
        .setLength(length)
        .setSiblingId(siblingId)
        .setType(type)
        .setPositions(positionInfos)
        .build();

    return section;
  }

  public void addPosition(Position position) {
    if(position.getSection() == null) {
      positions.add(position);
      position.setSection(this);
    }
  }

  public void removePosition(Position position) {
    positions.remove(position);
    position.setSection(null);
  }

  public void addCast(Cast cast) {
    cast.setSection(this);
    casts.add(cast);
  }

  public void removeCast(Cast cast) {
    cast.setSection(null);
    casts.remove(cast);
  }

  public void addPerformanceSection(PerformanceSection performanceSection) {
    performanceSection.setSection(this);
  }

  public void removePerformanceSection(PerformanceSection performanceSection) {
    performanceSection.setSection(null);
  }

  /* Searches for and returns a Position from positions based on id. */
  public Position getPositionById(Integer id)
      throws EntityNotFoundException, InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("PositionId cannot be null");
    }

    for (Position position : positions) {
      if((int) position.getId() == (int) id) {
        return position;
      }
    }

    throw new EntityNotFoundException(String.format(
        "Position with id %d does not exist for this Section", id));
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
    private Boolean isOpen;
    private String name;
    private String notes;
    private Integer length;
    private Integer siblingId;
    private Type type;

    // Violates pattern for auto generated index. Use with caution.
    public Builder setId(Integer id) {
      if(id != null) {
        this.id = id;
      }
      return this;
    }

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

    public Builder setSiblingId(Integer siblingId) {
      if(siblingId != null) {
        this.siblingId = siblingId == 0 ? null : siblingId;
      }
      return this;
    }

    public Builder setType(Type type) {
      if(type != null) {
        this.type = type;
      }
      return this;
    }

    public Section build() throws InvalidParameterException {
      if(this.name == null || this.type == null) {
        throw new InvalidParameterException("Section requires a name and a type");
      }
      section.id = this.id;
      section.name = this.name;
      section.notes = this.notes;
      section.length = this.length;
      section.siblingId = this.siblingId;
      section.type = this.type;
      return section;
    }

    public Builder(Section section) {
      this.section = section;
      this.id = section.id;
      this.name = section.name;
      this.notes = section.notes;
      this.length = section.length;
      this.siblingId = section.siblingId;
      this.type = section.type;
    }

    public Builder() {
      this.section = new Section();
    }
  } 
}
