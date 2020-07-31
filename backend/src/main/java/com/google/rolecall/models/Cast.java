package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.CastInfo;
import com.google.rolecall.jsonobjects.SubCastInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import java.security.InvalidParameterException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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
public class Cast {
  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private String name;

  @Basic
  private String notes;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private Section section;

  @OneToMany(mappedBy = "cast", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  private Set<SubCast> subCasts = new HashSet<>();

  public Integer getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getNotes() {
    return notes == null ? "" : notes;
  }

  public Section getSection() {
    return section;
  }

  public Set<SubCast> getSubCasts() {
    return subCasts;
  }

  public void addSubCast(SubCast subCast) {
    subCast.setCast(this);
    subCasts.add(subCast);
  }

  public void removeSubCast(SubCast subCast) {
    subCast.setCast(null);
    subCasts.remove(subCast);
  }

  /* Searches for and returns a SubCast from subCasts based on id. */
  public SubCast getSubCastById(Integer id)
      throws InvalidParameterException, EntityNotFoundException {
    if(id == null) {
      throw new InvalidParameterException("SubCastId cannot be null");
    }

    for (SubCast subCast : subCasts) {
      if(subCast.getId().equals(id)) {
        return subCast;
      }
    }

    throw new EntityNotFoundException(String.format(
        "Sub Cast with id %d does not exist for this Cast", id));
  }

  public CastInfo toCastInfo() {
    List<SubCastInfo> subCastInfos = subCasts.stream().map(c->c.toSubCastInfo())
        .collect(Collectors.toList());
    
    return CastInfo.newBuilder()
        .setId(getId())
        .setName(getName())
        .setNotes(getNotes())
        .setSectionId(getSection().getId())
        .setSubCasts(subCastInfos)
        .build();
  }

  void setSection(Section section) {
    this.section = section;
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public Cast() {
  }

  public static class Builder {
    private Cast cast;
    private String name;
    private String notes;

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

    public Cast build() {
      if(name == null) {
        throw new InvalidParameterException("Name is required to create a new cast.");
      }

      cast.name = this.name;
      cast.notes = this.notes;

      return cast;
    }

    public Builder() {
      this.cast = new Cast();
    }

    public Builder(Cast cast) {
      this.cast = cast;
      this.name = cast.name;
      this.notes = cast.notes;
    }
  }
}
