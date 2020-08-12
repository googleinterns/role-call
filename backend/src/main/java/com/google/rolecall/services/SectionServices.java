package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.PositionInfo;
import com.google.rolecall.jsonobjects.SectionInfo;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.repos.CastRepository;
import com.google.rolecall.repos.PerformanceCastMemberRepository;
import com.google.rolecall.repos.PerformanceSectionRepository;
import com.google.rolecall.repos.SectionRepository;
import com.google.rolecall.repos.SubCastRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
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

  private final SectionRepository sectionRepo;
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
    Section section = Section.newBuilder()
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .setType(newSection.type())
        .build();

    if(newSection.positions() != null && !newSection.positions().isEmpty()) {
      Set<Integer> orders = new HashSet<>();
      for(PositionInfo info: newSection.positions()) {
        Position position = Position.newBuilder()
            .setName(info.name())
            .setNotes(info.notes())
            .setOrder(info.order())
            .setSize(info.size())
            .build();
        if(orders.contains(position.getOrder())) {
          throw new InvalidParameterException("Order of Positions must not be overlapping");
        }
        orders.add(position.getOrder());
        section.addPosition(position);
      }
    }

    return sectionRepo.save(section);
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
    Section section = getSection(newSection.id()).toBuilder()
        .setName(newSection.name())
        .setNotes(newSection.notes())
        .setLength(newSection.length())
        .setType(newSection.type())
        .build();
    
    if(newSection.positions() != null && !newSection.positions().isEmpty()) {
      List<Position> positions = section.getPositions();
      for(PositionInfo info: newSection.positions()) {
        System.out.println(info);
        Position position;
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
          continue;
        } else if(info.id() != null) {
          position = section.getPositionById(info.id());
        } else {
          position = new Position();
        }
        position = position.toBuilder()
            .setName(info.name())
            .setNotes(info.notes())
            .setOrder(info.order())
            .setSize(info.size())
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

    return sectionRepo.save(section);
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

    if(performanceSectionRepo.findFirstBySection(section).isPresent() || 
        castRepo.findFirstBySection(section).isPresent()) {
      throw new InvalidParameterException(
          "Cannot delete Section if it has a Cast or is part of a Performance");
    }

    sectionRepo.deleteById(id);
  }

  public SectionServices(SectionRepository sectionRepo, CastRepository castRepo,
      SubCastRepository subCastRepo, PerformanceSectionRepository performanceSectionRepo,
      PerformanceCastMemberRepository performanceCastMemberRepo) {
    this.sectionRepo = sectionRepo;
    this.castRepo = castRepo;
    this.subCastRepo = subCastRepo;
    this.performanceSectionRepo = performanceSectionRepo;
    this.performanceCastMemberRepo = performanceCastMemberRepo;
  }
}
