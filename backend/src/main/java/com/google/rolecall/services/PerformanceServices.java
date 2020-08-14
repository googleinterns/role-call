package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.PerformanceCastInfo;
import com.google.rolecall.jsonobjects.PerformanceCastMemberInfo;
import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.jsonobjects.PerformancePositionInfo;
import com.google.rolecall.jsonobjects.PerformanceSectionInfo;
import com.google.rolecall.models.Performance;
import com.google.rolecall.models.PerformanceCastMember;
import com.google.rolecall.models.PerformanceSection;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.models.User;
import com.google.rolecall.models.Performance.Status;
import com.google.rolecall.repos.PerformanceRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("performanceServices")
@Transactional(rollbackFor = Exception.class)
public class PerformanceServices {

  private final PerformanceRepository performanceRepo;
  private final SectionServices sectionService;
  private final UserServices userService;
  
  public Performance getPerformance(Integer id) throws EntityNotFoundException,
      InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("Performance Requires Id");
    }
    Optional<Performance> query = performanceRepo.findById(id);

    if(query.isEmpty()) {
      throw new EntityNotFoundException(String.format("No Performance with id %d", id));
    }

    return query.get();
  }

  public List<Performance> getAllPerformances() {
    List<Performance> allPerformances = new ArrayList<>();
    performanceRepo.findAll().forEach(allPerformances::add);

    return allPerformances;
  }

  public ServiceResult<Performance> createPerformance(PerformanceInfo newPerformance)
      throws InvalidParameterException, EntityNotFoundException {
    Performance performance = buildNewPerformance(newPerformance);
    List<String> warnings = verifyPerformance(performance);

    performance = performanceRepo.save(performance);

    ServiceResult<Performance> result = new ServiceResult<>(performance, warnings);
    return result;
  }

  public ServiceResult<Performance> editPerformance(PerformanceInfo newPerformance)
      throws InvalidParameterException, EntityNotFoundException {
    Performance performance = updatePerformance(newPerformance);
    List<String> warnings = verifyPerformance(performance);

    performance = performanceRepo.save(performance);

    ServiceResult<Performance> result = new ServiceResult<>(performance, warnings);
    return result;
  }

  public void deletePerformance(int id) throws EntityNotFoundException,
      InvalidParameterException{
    Performance performance = getPerformance(id);
    if(performance.getStatus() == Status.PUBLISHED || performance.getStatus() == Status.CANCLED) {
      throw new InvalidParameterException(
          "Cannot delete performance that has been published or cancled");
    }

    performanceRepo.deleteById(id);
  }

  // Helper Methods

  private Performance buildNewPerformance(PerformanceInfo info) 
    throws InvalidParameterException, EntityNotFoundException {
    Performance performance = Performance.newBuilder()
        .setTitle(info.title())
        .setDescription(info.description())
        .setLocation(info.location())
        .setDateTime(info.dateTime())
        .build();

    if(info.status() == Status.PUBLISHED) {
      performance.publish();
    }

    if(info.performanceSections() != null && !info.performanceSections().isEmpty()) {
      performance = addNewSections(performance, info.performanceSections());
    }
    
    return performance;  
  }

  private Performance addNewSections(Performance performance, List<PerformanceSectionInfo> program)
      throws InvalidParameterException, EntityNotFoundException {
    for(PerformanceSectionInfo info: program) {
      PerformanceSection performanceSection = PerformanceSection.newBuilder()
          .setPrimaryCast(info.primaryCast())
          .setSectionPosition(info.sectionPosition())
          .build();

      Section section = sectionService.getSection(info.sectionId());
      section.addPerformanceSection(performanceSection);
      performance.addPerformanceSection(performanceSection);

      if(info.positions() != null) {
        performanceSection = addNewCastMembers(performanceSection, info.positions());
      }
    }

    return performance;
  }

  private Performance deleteSections(Performance performance,
      List<PerformanceSectionInfo> deleteSections) throws InvalidParameterException,
      EntityNotFoundException {
    for(PerformanceSectionInfo info: deleteSections) {
      PerformanceSection performanceSection = performance.getPerformanceSectionById(info.id());
      performance.removePerformanceSection(performanceSection);
      performanceSection.getSection().removePerformanceSection(performanceSection);
    }

    return performance;
  }

  private Performance editExistingPerformanceSections(Performance performance,
      List<PerformanceSectionInfo> editSections) throws InvalidParameterException,
      EntityNotFoundException {
    for(PerformanceSectionInfo info: editSections) {
      PerformanceSection performanceSection = performance.getPerformanceSectionById(info.id())
          .toBuilder()
          .setPrimaryCast(info.primaryCast())
          .setSectionPosition(info.sectionPosition())
          .build();

      if(info.positions() != null) {
        performanceSection = updateCastMembers(performanceSection, info.positions());
      }

      int primaryCast = performanceSection.getPrimaryCast();

      performanceSection.getPerformanceCastMembers().forEach(member -> 
          member.setPerforming(primaryCast == member.getCastNumber()));
    }

    return performance;
  }

  private PerformanceSection addNewCastMembers(PerformanceSection performanceSection,
      List<PerformancePositionInfo> performancePositions) throws InvalidParameterException,
      EntityNotFoundException {
    for(PerformancePositionInfo positionInfo: performancePositions) {
      Position currentPosition = performanceSection.getSection()
          .getPositionById(positionInfo.positionId());

      if(positionInfo.performanceCasts() == null || positionInfo.performanceCasts().isEmpty()) {
        continue;
      }

      for(PerformanceCastInfo castsInfo: positionInfo.performanceCasts()) {
        Integer currentCastNumber = castsInfo.castNumber();
        boolean isPerforming = currentCastNumber == performanceSection.getPrimaryCast();
        
        if(castsInfo.performanceCastMembers() == null) {
          continue;
        }

        for(PerformanceCastMemberInfo memberInfo: castsInfo.performanceCastMembers()) {
          performanceSection = addPerformanceCastMember(performanceSection, memberInfo,
              currentPosition, currentCastNumber, isPerforming);
        }
      }
    }

    return performanceSection;
  }

  private PerformanceSection addPerformanceCastMember(PerformanceSection performanceSection, 
      PerformanceCastMemberInfo memberInfo, Position position, int castNumber,
      boolean isPerforming) throws InvalidParameterException,
      EntityNotFoundException {

    User user = userService.getUser(memberInfo.userId());

    PerformanceCastMember member = PerformanceCastMember.newBuilder()
        .setOrder(memberInfo.order())
        .setCastNumber(castNumber)
        .build();
    
    member.setPerforming(isPerforming);

    user.addPerformanceCastMember(member);
    position.addPerformanceCastMember(member);
    performanceSection.addPerformanceCastMember(member);
    performanceSection.getPerformance().addPerformanceCastMember(member);

    return performanceSection;
  }

  private PerformanceSection updatePerformanceCastMember(PerformanceSection performanceSection, 
      PerformanceCastMemberInfo memberInfo, Position position, int castNumber)
      throws InvalidParameterException, EntityNotFoundException {

    performanceSection.getPerformanceCastMemberById(memberInfo.id()).toBuilder()
        .setOrder(memberInfo.order())
        .setCastNumber(castNumber)
        .build();

    return performanceSection;
  }

  private PerformanceSection updateCastMembers(PerformanceSection performanceSection,
      List<PerformancePositionInfo> performancePositions) throws InvalidParameterException,
      EntityNotFoundException {
    for(PerformancePositionInfo positionInfo: performancePositions) {
      Position currentPosition = performanceSection.getSection()
          .getPositionById(positionInfo.positionId());

      if(positionInfo.performanceCasts() == null || positionInfo.performanceCasts().isEmpty()) {
        continue;
      }

      for(PerformanceCastInfo castsInfo: positionInfo.performanceCasts()) {
        Integer currentCastNumber = castsInfo.castNumber();
        boolean isPerforming = currentCastNumber == performanceSection.getPrimaryCast();
        
        if(castsInfo.performanceCastMembers() == null) {
          continue;
        }

        for(PerformanceCastMemberInfo memberInfo: castsInfo.performanceCastMembers()) {
          if(memberInfo.delete() != null && memberInfo.delete()) {
            deletePerformanceCastMember(performanceSection, memberInfo);
          } else if(memberInfo.id() == null) {
            performanceSection = addPerformanceCastMember(performanceSection, memberInfo,
                currentPosition, currentCastNumber, isPerforming);
          } else {
            updatePerformanceCastMember(performanceSection, memberInfo,
            currentPosition, currentCastNumber);
          }
        }
      }
    }

    return performanceSection;
  }

  private PerformanceSection deletePerformanceCastMember(PerformanceSection performanceSection,
      PerformanceCastMemberInfo info) throws InvalidParameterException,
      EntityNotFoundException {
    PerformanceCastMember member = performanceSection.getPerformanceCastMemberById(info.id());

    performanceSection.removePerformanceCastMember(member);
    member.getPosition().removePerformanceCastMember(member);
    member.getUser().removePerformanceCastMember(member);
    member.getPerformance().removePerformanceCastMember(member);

    return performanceSection;
  }

  private Performance updatePerformance(PerformanceInfo info) 
    throws InvalidParameterException, EntityNotFoundException {
    Performance performance = getPerformance(info.id()).toBuilder()
        .setTitle(info.title())
        .setDescription(info.description())
        .setLocation(info.location())
        .setDateTime(info.dateTime())
        .build();

    if(info.status() == Status.PUBLISHED) {
      performance.publish();
    } else if(info.status() == Status.CANCLED) {
      performance.cancel();
    }

    if(info.performanceSections() != null && !info.performanceSections().isEmpty()) {
      performance = updateSections(performance, info.performanceSections());
    }
    
    return performance;  
  }

  private Performance updateSections(Performance performance, List<PerformanceSectionInfo> program)
      throws InvalidParameterException, EntityNotFoundException {
    List<PerformanceSectionInfo> deleteSections = new ArrayList<>();
    List<PerformanceSectionInfo> addSections = new ArrayList<>();
    List<PerformanceSectionInfo> editSections = new ArrayList<>();

    for(PerformanceSectionInfo info: program) {
      if(info.delete() != null && info.delete()) {
        deleteSections.add(info);
      } else if(info.id() == null) {
        addSections.add(info);
      } else {
        editSections.add(info);
      }
    }
    performance = deleteSections(performance, deleteSections);
    performance = addNewSections(performance, addSections);
    performance = editExistingPerformanceSections(performance, editSections);

    return performance;
  }

  private List<String> verifyPerformance(Performance performance) throws InvalidParameterException {
    List<String> warnings = new ArrayList<>();

    HashSet<Integer> uniqueSectionPositions = new HashSet<>();
    Hashtable<Integer, HashSet<Integer>> uniqueMembersByCastNumber = new Hashtable<>();
    for(PerformanceSection section: performance.getProgram()) {
      Integer order = section.getSectionPosition();

      if(uniqueSectionPositions.contains(order)) {
        throw new InvalidParameterException(
          "All Performance Sections must have unique section positions");
      }
      uniqueSectionPositions.add(order);

      Hashtable<Position, Hashtable<Integer, HashSet<Integer>>> uniqueOrders = new Hashtable<>();
      for(PerformanceCastMember member: section.getPerformanceCastMembers()) {
        // Validity Check
        Hashtable<Integer, HashSet<Integer>>positionOrders;
        Position position = member.getPosition();

        if(uniqueOrders.containsKey(position)) {
          positionOrders = uniqueOrders.get(position);
        } else {
          positionOrders = new Hashtable<>();
          uniqueOrders.put(position, positionOrders);
        }
        
        HashSet<Integer> orders;
        int castNumber = member.getCastNumber();

        if(positionOrders.containsKey(castNumber)) {
          orders = positionOrders.get(castNumber);
        } else {
          orders = new HashSet<>();
          positionOrders.put(castNumber, orders);
        }

        if(orders.contains(member.getOrder())) {
          throw new InvalidParameterException(
            "Each Cast Member must have an order unique to cast number and Position");
        }
        orders.add(member.getOrder());

        // Warnings Check
        HashSet<Integer> cast;
        if(uniqueMembersByCastNumber.containsKey(castNumber)) {
          cast = uniqueMembersByCastNumber.get(castNumber);
        } else {
          cast = new HashSet<>();
          uniqueMembersByCastNumber.put(castNumber, cast);
        }

        User user = member.getUser();
        if(cast.contains(user.getId())) {
          warnings.add(String.format("User %s %s appears multiple times in cast %d",
              user.getFirstName(), user.getLastName(), castNumber));
        } else {
          cast.add(user.getId());
        }
      }
    }

    return warnings;
  }

  public PerformanceServices(PerformanceRepository performanceRepo,
      SectionServices sectionService, UserServices userService) {
    this.performanceRepo = performanceRepo;
    this.sectionService = sectionService;
    this.userService = userService;
  }
}
