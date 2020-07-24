package com.google.rolecall.models;

import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.util.ArrayList;
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

/* Represents a Position for a User in a Section. */
@Entity
@Table
public class Position {

  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private String name;

  @Basic
  private String notes;

  @Column(name = "orderOf", nullable = false)
  private Integer order;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Section section;

  @OneToMany(mappedBy = "position", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true,
      fetch = FetchType.EAGER)
  private List<Cast> casts = new ArrayList<>();

  public Integer getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getNotes() {
    return notes == null ? "" : notes;
  }

  public int getOrder() {
    return order;
  }

  public Section getSection() {
    return section;
  }

  public List<Cast> getCasts() {
    return casts;
  }

  public void addCast(Cast cast) throws InvalidParameterException {
    if(cast.getPosition() != null) {
      throw new InvalidParameterException("Cannot change cast Position once it's set.");
    }
    cast.setPosition(this);
    casts.add(cast);
  }

  public void removeCast(Cast cast) throws InvalidParameterException {
    if(cast.getPosition() != this) {
      throw new InvalidParameterException("Cannot remove cast from different Position once it's set.");
    }
    cast.setPosition(null);
    casts.remove(cast);
  }

  void setSection(Section section) {
    this.section = section;
  }

  @Override
  public boolean equals(Object object) {
    if(!(object instanceof Position)) {
      return false;
    }

    Position position = (Position) object;
    if(this.id == null || position.id == null) {
      return false;
    }

    return this.id.equals(position.id);
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public Position() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private Position position;
    private Integer id;
    private String name;
    private String notes;
    private Integer order;
    private Section section;

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

    public Builder setOrder(Integer order) {
      if(order != null) {
        this.order = order;
      }
      return this;
    }

    public Position build() throws InvalidParameterException {
      if(name == null || order == null) {
        throw new InvalidParameterException("All positions require a name and an order");
      }
      position.id = this.id;
      position.name = this.name;
      position.notes = this.notes;
      position.order = this.order;
      position.section = this.section;

      return position;
    }

    public Builder(Position position) {
      this.position = position;
      this.id = position.id;
      this.name = position.name;
      this.notes = position.notes;
      this.order = position.order;
      this.section = position.section;
    }

    public Builder() {
      this.position = new Position();
    }
  }
}