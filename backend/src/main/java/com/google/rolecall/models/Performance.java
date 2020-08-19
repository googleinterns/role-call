package com.google.rolecall.models;

import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.jsonobjects.PerformanceSectionInfo;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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


@Entity
@Table
public class Performance {

  public enum Status {
    PUBLISHED, CANCELED, DRAFT;
  }
  
  @Id
  @GeneratedValue(strategy=GenerationType.AUTO)
  private Integer id;

  @Column(nullable = false)
  private String title;

  @Column(length=1024)
  private String description;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String state;

  @Column(nullable = false)
  private String country;

  @Column(nullable = false)
  private String venue;

  @Column(nullable = false)
  private Timestamp dateTime;

  @Enumerated(EnumType.ORDINAL)
  private Status status;

  // This as a set masks a larger issue PerformanceRepository.getById duplicates sections
  @OneToMany(mappedBy = "performance", 
      cascade = CascadeType.ALL, 
      orphanRemoval = true, 
      fetch = FetchType.EAGER)
  private Set<PerformanceSection> performanceSections = new HashSet<>();

  public Integer getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public String getDescription() {
    return description == null ? "" : description;
  }

  public String getCity() {
    return city;
  }

  public String getState() {
    return state;
  }

  public String getCountry() {
    return country;
  }

  public String getVenue() {
    return venue;
  }

  public Timestamp getDate() {
    return dateTime;
  }

  public Status getStatus() {
    return status;
  }

  public List<PerformanceSection> getProgram() {
    return new ArrayList<>(performanceSections);
  }

  public void publish() {
    if(status == Status.DRAFT) {
      this.status = Status.PUBLISHED;
    }
  }

  public void cancel() {
    if(status == Status.PUBLISHED) {
      this.status = Status.CANCELED;
    }
  }

  public void addPerformanceSection(PerformanceSection performanceSection) {
    performanceSection.setPerformance(this);
    performanceSections.add(performanceSection);
  }

  public void removePerformanceSection(PerformanceSection performanceSection) {
    performanceSection.setPerformance(null);
    performanceSections.remove(performanceSection);
  }

  public void addPerformanceCastMember(PerformanceCastMember member) {
    member.setPerformance(this);
  }

  public void removePerformanceCastMember(PerformanceCastMember member) {
    member.setPerformance(null);
  }

  public PerformanceSection getPerformanceSectionById(Integer id)
      throws EntityNotFoundException, InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("PerformanceSectionId cannot be null");
    }

    for (PerformanceSection section : performanceSections) {
      if((int) section.getId() == (int) id) {
        return section;
      }
    }

    throw new EntityNotFoundException(String.format(
        "PerformacneSection with id %d does not exist for this Performance", id));
  }

  public PerformanceInfo toPerformanceInfo() {
    List<PerformanceSectionInfo> sections = performanceSections
        .stream().map(s -> s.toPerformanceSectionInfo())
        .collect(Collectors.toList());

    PerformanceInfo info = PerformanceInfo.newBuilder()
        .setId(id)
        .setTitle(getTitle())
        .setDescription(getDescription())
        .setCity(getCity())
        .setState(getState())
        .setCountry(getCountry())
        .setVenue(getVenue())
        .setDateTime(getDate().getTime())
        .setStatus(getStatus())
        .setPerformanceSections(sections)
        .build();

    return info;
  }

  public Builder toBuilder() {
    return new Builder(this);
  }

  public Performance() {
  }

  public static Builder newBuilder() {
    return new Builder();
  }

  public static class Builder {
    private Performance performance;
    private String title;
    private String description;
    private String city;
    private String state;
    private String country;
    private String venue;
    private Timestamp dateTime;

    public Builder setTitle(String title) {
      if(title != null) {
        this.title = title;
      }

      return this;
    }

    public Builder setDescription(String description) {
      if(description != null) {
        this.description = description;
      }

      return this;
    }

    public Builder setCity(String city) {
      if(city != null) {
        this.city = city;
      }

      return this;
    }

    public Builder setState(String state) {
      if(state != null) {
        this.state = state;
      }

      return this;
    }

    public Builder setCountry(String country) {
      if(country != null) {
        this.country = country;
      }

      return this;
    }

    public Builder setVenue(String venue) {
      if(venue != null) {
        this.venue = venue;
      }

      return this;
    }

    public Builder setDateTime(Long dateTimeMilis) {
      if(dateTimeMilis != null) {
        this.dateTime = new Timestamp(dateTimeMilis);
      }

      return this;
    }

    public Performance build() throws InvalidParameterException {
      if(title == null || city == null ||  state == null ||  country == null || dateTime == null) {
        throw new InvalidParameterException("Performance requires a Title, Location, and a Time");
      }

      performance.title = this.title;
      performance.description = this.description;
      performance.city = this.city;
      performance.state = this.state;
      performance.country = this.country;
      performance.dateTime = this.dateTime;
      performance.venue = this.venue;

      return performance;
    }


    public Builder(Performance performance) {
      this.performance = performance;
      this.title = performance.getTitle();
      this.description = performance.getDescription();
      this.city = performance.city;
      this.state = performance.state;
      this.country = performance.country;
      this.dateTime = performance.getDate();
      this.venue = performance.getVenue();
    }

    public Builder() {
      this.performance = new Performance();
      this.venue = "";
      performance.status = Status.DRAFT;
    }
  }
}
