package com.google.rolecall.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.google.rolecall.jsonobjects.PositionInfo;
import com.google.rolecall.jsonobjects.SectionInfo;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.repos.SectionRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import org.springframework.stereotype.Service;

/* Creates, edits, fetches and deletes position and section objects. */
@Service("sectionServices")
public class SectionServices {

  private final SectionRepository sectionRepo;

  /** 
   * Queries for and returns a list of every {@link Section} object in the Database.
   * 
   * @return A list of all {@link Section} objects.
   */
  public List<Section> getAllSections() {
    List<Section> allSections = new ArrayList<>();
    sectionRepo.findAll().forEach(allSections::add);

    return allSections;
  }

  /** 
   * Queries for and returns a {@link Section} object based on id.
   * 
   * @param id The id unique to a {@link Section} object.
   * @return A {@link Section} object associated with id.
   * @throws EntityNotDoundException when there is not section containing the id.
   */
  public Section getSection(int id) throws EntityNotFoundException {
    Optional<Section> queryResult = sectionRepo.findById(id);

    if (!queryResult.isPresent()) {
        throw new EntityNotFoundException(String.format("sectionid %d does not exist", id));
    }

    return queryResult.get();
  }

  /** 
   * Creates a new {@link Section} and {@link Positions} and adds it to the database.
   * 
   * @param newSection {@link SectionInfo} containing information describing the new user.
   * @return The new {@link User} created and stored.
   * @throws InvalidParameterException When firstName, lastName, or email are null in
   *    {@link UserInfo} newUser and when the email is malformatted or already exists.
   */
  public Section createSection(SectionInfo newSection) throws InvalidParameterException {
    
    Section section = Section.newBuilder()
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .build();

    Set<Integer> orders = new HashSet<>();
    for(PositionInfo info: newSection.positions()) {
      Position position = Position.newBuilder()
          .setName(info.name())
          .setNotes(info.notes())
          .setOrder(info.order())
          .build();
      if(orders.contains(position.getOrder())) {
        throw new InvalidParameterException("Order of Positions must not be overlapping");
      }
      orders.add(position.getOrder());
      section.addPosition(position);
    }

    return sectionRepo.save(section);
  }

  public SectionServices(SectionRepository sectionRepo) {
    this.sectionRepo = sectionRepo;
  }
  
}