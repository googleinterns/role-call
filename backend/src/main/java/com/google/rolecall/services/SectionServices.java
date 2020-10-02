package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.PositionInfo;
import com.google.rolecall.jsonobjects.SectionInfo;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.repos.CastRepository;
import com.google.rolecall.repos.PerformanceCastMemberRepository;
import com.google.rolecall.repos.PerformanceSectionRepository;
import com.google.rolecall.repos.PositionRepository;
import com.google.rolecall.repos.SectionRepository;
import com.google.rolecall.repos.SubCastRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/* Creates, edits, fetches and deletes position and section objects. */
@Service("sectionServices")
@Transactional(rollbackFor = Exception.class)
public class SectionServices {

  private enum SiblingError {
    OK,
    SIBLING_MISSING,
    OTHER_ERROR
  }

  private final SectionRepository sectionRepo;
  private final PositionRepository positionRepo;
  private final CastRepository castRepo;
  private final SubCastRepository subCastRepo;
  private final PerformanceSectionRepository performanceSectionRepo;
  private final PerformanceCastMemberRepository performanceCastMemberRepo;

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
   * @throws EntityNotFoundException when there is not a Section containing the id.
   */
  public Section getSection(Integer id) throws EntityNotFoundException, InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("Cannot find Section with null id");
    }

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
   * @throws InvalidParameterException When Section is missing name, Positions are missing names,
   *     or Positions have overlapping orders.
   */
  public Section createSection(SectionInfo newSection) throws InvalidParameterException {
    Boolean isParentRevelation = newSection.type() == Section.Type.REVELATION;
    Section section = Section.newBuilder()
        .setIsOpen(newSection.isOpen())
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .setSiblingId(newSection.siblingId())
        .setType(newSection.type())
        .build();

    Integer[] siblingIndexArray = new Integer[newSection.positions().size()];
    if(newSection.positions() != null && !newSection.positions().isEmpty()) {
      Set<Integer> orders = new HashSet<>();
      for(int loopCounter = 0; loopCounter < newSection.positions().size(); loopCounter++) {
        PositionInfo info = newSection.positions().get(loopCounter);
        Section savedSubSection = null;

        if(isParentRevelation) {
          // Create sibling Ballets to Revelation's internal Ballet/Position structures
          // The ids will be inserted into Revelation's internal Ballet/Position structures
          Section subSection = Section.newBuilder()
              .setIsOpen(false)
              .setName(info.name())
              .setNotes("")
              .setLength(0)
              .setSiblingId(0)
              .setType(Section.Type.PIECE)
              .build();
          savedSubSection = sectionRepo.save(subSection);
          siblingIndexArray[loopCounter] = savedSubSection.getId();
        }
        
        Position position = Position.newBuilder()
            .setName(info.name())
            .setNotes(info.notes())
            .setOrder(info.order())
            .setSiblingId(savedSubSection == null ? null : savedSubSection.getId())
            .setSize(isParentRevelation ? -1 : info.size())
            .build();
            
        if(orders.contains(position.getOrder())) {
          throw new InvalidParameterException("Order of Positions must not be overlapping");
        }
        orders.add(position.getOrder());
        section.addPosition(position);
      }
    }
    Section savedSection = sectionRepo.save(section);
    updateRevelationChildren(savedSection, siblingIndexArray, isParentRevelation);
    return savedSection;
  }

  /** 
   * Edits a {@link Section} and it's {@link Positions} and updates it in the database.
   * The {@link SectionInfo} should contain an existing id of an {@link Section}. {@link Positions}
   * can be created, edited, or deleted. The Position will be deleted if {@link PositionInfo}
   * it contains a valid id and and delete is true. The Position will be edited if 
   * {@link PositionInfo} contains a valid id and delete is not true. The position will be
   * created if there is no id in {@link PositionInfo}. Only positions associated with the
   * {@link Section} can be edited or deleted.
   * 
   * @param newSection {@link SectionInfo} describes the Section and positions.
   * @return The updated {@link Section}.
   * @throws InvalidParameterException When new Positions are missing names,
   *     a Position without id is deleted, or Positions have overlapping orders.
   * @throws EntityNotFoundException When there is not Section containing the id,
   *     when there is not a Position containg the position id in the Section.
   */
  public Section editSection(SectionInfo newSection) throws EntityNotFoundException,
      InvalidParameterException {
    Boolean isParentRevelation = newSection.type() == Section.Type.REVELATION;

    // Make sure that sibling Ballet and Position / Ballet items are synchronized

    // Check for sibling of Ballet section
    Integer sectionSiblingId = newSection.siblingId();
    if(sectionSiblingId != null) { 
      SiblingError errCd = updateSiblingPosition(sectionSiblingId, newSection.name(), -1);
      if (errCd != SiblingError.OK) {
        sectionSiblingId = null;
      }
    }
    
    // Check for sibling of Ballet children of Revelation section
    int[] badIdArray = new int[newSection.positions().size()];
    Arrays.fill(badIdArray, 0);

    if(isParentRevelation) {
      // Check for sibling of Ballet children of Revelation section
      if(newSection.positions() != null && !newSection.positions().isEmpty()) {
        for(int loopCounter = 0; loopCounter < newSection.positions().size(); loopCounter++) {
          PositionInfo info = newSection.positions().get(loopCounter);
          if(info.delete() != null && info.delete()) {
            // Deleting position items
            Integer siblingId = info.siblingId();
            if(siblingId != null) {
              Integer positionSiblingId = info.siblingId();
              if(positionSiblingId != null) {
                // Erase reference in sibling
                updateSiblingSection(positionSiblingId, "", 0);
              }  
            }
            continue;
          } else if(info.id() != null) {
            // Saving existing position items
            Integer positionSiblingId = info.siblingId();
            if(positionSiblingId != null) { 
              SiblingError errCd = updateSiblingSection(positionSiblingId, info.name(), -1);
              if (errCd != SiblingError.OK) {
                badIdArray[loopCounter] = 1;
              }
            }
          }
        }
      }
    }
    // Done synchronizing siblings

    Integer[] siblingIndexArray = new Integer[newSection.positions().size()];
    Section section = getSection(newSection.id()).toBuilder()
        .setIsOpen(newSection.isOpen())
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .setSiblingId(sectionSiblingId)
        .setType(newSection.type())
        .build();

    if(newSection.positions() != null && !newSection.positions().isEmpty()) {
      List<Position> positions = section.getPositions();
      for(int loopCounter = 0; loopCounter < newSection.positions().size(); loopCounter++) {
        PositionInfo info = newSection.positions().get(loopCounter);
        Position position;
        Section savedSubSection = null;
        if(info.delete() != null && info.delete()) {
          if(info.id() == null) {
            throw new InvalidParameterException("Cannot delete Position before it is created.");
          }

          Position positionToDelete = section.getPositionById(info.id());
          if(subCastRepo.findFirstByPosition(positionToDelete).isPresent() ||
              performanceCastMemberRepo.findFirstByPosition(positionToDelete).isPresent()) {
                throw new InvalidParameterException(
                    "Cannot delete Position if it has a cast or is involved in a performance.");
          }

          section.removePosition(positionToDelete);
          siblingIndexArray[loopCounter] = -1;
          continue;
        } else if(info.id() != null) {
          position = section.getPositionById(info.id());
          siblingIndexArray[loopCounter] = -1;
        } else {
          siblingIndexArray[loopCounter] = -1;
          if(isParentRevelation) {
            // New Ballet-Child
            // Create sibling Ballets to Revelation's internal Ballet/Position structures
            // The ids will be inserted into Revelation's internal Ballet/Position structures
            Section subSection = Section.newBuilder()
                .setIsOpen(false)
                .setName(info.name())
                .setNotes("")
                .setLength(0)
                .setSiblingId(0)
                .setType(Section.Type.PIECE)
                .build();
            savedSubSection = sectionRepo.save(subSection);
            siblingIndexArray[loopCounter] = savedSubSection.getId();
          }
          position = new Position();
        }
        position = position.toBuilder()
            .setName(info.name())
            .setNotes(info.notes())
            .setOrder(info.order())
            .setSiblingId(badIdArray[loopCounter] > 0 ? null : siblingIndexArray[loopCounter] == - 1
                ? info.siblingId() : siblingIndexArray[loopCounter])
            .setSize(isParentRevelation ? -1 : info.size())
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
    }
    Section savedSection = sectionRepo.save(section);
    updateRevelationChildren(savedSection, siblingIndexArray, isParentRevelation);
    return savedSection;
  }

  /** 
   * Deletes an existing {@link Section} object by id and all children objects.
   * 
   * @param id Unique id for the {@link Section} object to be deleted
   * @throws EntityNotFoundException The id does not match and existing {@link Section}
   *    in the database.
   */
  public void deleteSection(int id) throws EntityNotFoundException, InvalidParameterException {
    Section section = getSection(id);

    Integer siblingId = section.getSiblingId();
    if(siblingId != null) {
      Optional<Position> test = positionRepo.findById(siblingId);
      if(test.isEmpty()) {
        // Revelation's internal Ballet/Position structure has already been deleted
      } else {
        // Revelation's internal Ballet/Position structure still exists
        throw new InvalidParameterException(
          "Cannot delete Ballet that is part of a Revelation");
      }
    }

    if(performanceSectionRepo.findFirstBySection(section).isPresent() || 
        castRepo.findFirstBySection(section).isPresent()) {
      throw new InvalidParameterException(
          "Cannot delete Ballet if it has a Cast or is part of a Performance");
    }

    sectionRepo.deleteById(id);
  }

  // Utility functions

  private void updateRevelationChildren(Section section, Integer[] siblingIndexArray,
      boolean isParentRevelation) throws InvalidParameterException {
    if(isParentRevelation) {
      // Update sibling Ballets with ids of Revelation's internal Ballet/Position structures
      for(int loopCounter = 0; loopCounter < section.getPositions().size(); loopCounter++) {
        if(siblingIndexArray[loopCounter] != -1) {
          Position pos = section.getPositions().get(loopCounter);
          Section subSection = Section.newBuilder()
              .setId(siblingIndexArray[loopCounter])
              .setIsOpen(false)
              .setName(pos.getName())
              .setNotes("")
              .setLength(0)
              .setSiblingId(pos.getId())
              .setType(Section.Type.PIECE)
              .build();
          sectionRepo.save(subSection);
        }
      }
    }
  }

  private SiblingError updateSiblingPosition(Integer positionId,
      String newName,     // null or "": keep existing name
      Integer siblingId   // -1: keep existing. 0: remove reference
  ) {
    if(positionId != null) {
      Optional<Position> queryPosition = positionRepo.findById(positionId);

      if(queryPosition.isEmpty()) {
        return SiblingError.SIBLING_MISSING;
      } else {
        try {
          Position sibling = queryPosition.get();
          Position updatedSibling = sibling.toBuilder()
              .setId(positionId)
              .setName(newName == null || newName.length() == 0 ? sibling.getName() : newName)
              .setNotes(sibling.getNotes())
              .setOrder(sibling.getOrder())
              .setSiblingId(siblingId == -1 ? sibling.getSiblingId() : siblingId)
              .setSize(sibling.getSiblingId())
              .build();
          positionRepo.save(updatedSibling);
        } catch (InvalidParameterException e) {
          return SiblingError.OTHER_ERROR;
        }
      }
    }
    return SiblingError.OK;
  }

  private SiblingError updateSiblingSection(Integer sectionId,
      String newName,     // null or "": keep existing name
      Integer siblingId   // -1: keep existing. 0: remove reference
  ) {
    if(sectionId != null) {
      Optional<Section> querySection = sectionRepo.findById(sectionId);

      if(querySection.isEmpty()) {
        return SiblingError.SIBLING_MISSING;
      } else {
        try {
          Section sibling = querySection.get();
          Section updatedSibling = sibling.toBuilder()
              .setId(sectionId)
              .setIsOpen(false)
              .setName(newName == null || newName.length() == 0 ? sibling.getName() : newName)
              .setNotes(sibling.getNotes())
              .setLength(sibling.getLength().get())
              .setSiblingId(siblingId == -1 ? sibling.getSiblingId() : siblingId)
              .setType(sibling.getType())
              .build();
          sectionRepo.save(updatedSibling);
        } catch (InvalidParameterException e) {
          return SiblingError.OTHER_ERROR;
        }
      }
    }
    return SiblingError.OK;
  }

  public SectionServices(SectionRepository sectionRepo, PositionRepository positionRepo,
      CastRepository castRepo, SubCastRepository subCastRepo, PerformanceSectionRepository performanceSectionRepo,
      PerformanceCastMemberRepository performanceCastMemberRepo) {
    this.sectionRepo = sectionRepo;
    this.positionRepo = positionRepo;
    this.castRepo = castRepo;
    this.subCastRepo = subCastRepo;
    this.performanceSectionRepo = performanceSectionRepo;
    this.performanceCastMemberRepo = performanceCastMemberRepo;
  }
}
