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
   * @param newSection {@link SectionInfo} containing information describing the new Section.
   * @return The new {@link Section} created and stored.
   * @throws InvalidParameterException When section is missing name, Positions are missing names,
   *     or Positions have overlapping orders.
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

  /** 
   * Edits a {@link Section} and {@link Positions} and adds it to the database.
   * 
   * @param newSection {@link SectionInfo} containing information describing the new user.
   * @return The new {@link User} created and stored.
   * @throws InvalidParameterException When firstName, lastName, or email are null in
   *    {@link UserInfo} newUser and when the email is malformatted or already exists.
   */
  public Section editSection(SectionInfo newSection) throws EntityNotFoundException,
      InvalidParameterException {
    Section section = getSection(newSection.id()).toBuilder()
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .build();
    
    List<Position> positions = section.getPositions();
    for(PositionInfo info: newSection.positions()) {
      Position position;
      if(info.delete() != null && info.delete()) {
        if(info.id() == null) {
          throw new InvalidParameterException("Cannot delete Position without id.");
        }
        positions.remove(getPositionById(info.id(), positions));
        continue;
      } else if(info.id() != null) {
        position = getPositionById(info.id(), positions);
      } else {
        position = new Position();
      }
      position = position.toBuilder()
          .setName(info.name())
          .setNotes(info.notes())
          .setOrder(info.order())
          .build();
      section.addPosition(position);
    }

    Set<Integer> orders = new HashSet<>();
    for(Position position: positions) {
      if(orders.contains(position.getOrder())) {
        throw new InvalidParameterException("Order of Positions must not be overlapping");
      }
      orders.add(position.getOrder());
    }

    return sectionRepo.save(section);
  }

  private Position getPositionById(int id, List<Position> positions)
      throws EntityNotFoundException {
    for (Position position : positions) {
      if(position.getId() == id) {
        return position;
      }
    }
    throw new EntityNotFoundException(String.format(
        "Position with id %d does not exist for this Section", id));
  }

  public SectionServices(SectionRepository sectionRepo) {
    this.sectionRepo = sectionRepo;
  }
}
