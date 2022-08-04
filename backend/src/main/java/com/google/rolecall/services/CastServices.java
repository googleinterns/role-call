package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.SubCastInfo;
import com.google.rolecall.jsonobjects.CastInfo;
import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.models.Cast;
import com.google.rolecall.models.CastMember;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.models.SubCast;
import com.google.rolecall.models.Unavailability;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.sql.Date;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("castServices")
@Transactional(rollbackFor = Exception.class)
public class CastServices {
  
  private final CastRepository castRepo;
  private final UserServices userService;
  private final SectionServices sectionService;
  private final UnavailabilityServices unavailabilityService;

  public Cast getCast(Integer id) throws EntityNotFoundException, InvalidParameterException {
    if(id == null) {
      throw new InvalidParameterException("Cast Requires Id");
    }
    Optional<Cast> query = castRepo.findById(id);

    if(query.isEmpty()) {
      throw new EntityNotFoundException(String.format("No Cast with id %d", id));
    }

    return query.get();
  }

  public List<Cast> getAllCasts(long perfdate) {
    List<Cast> allCasts = new ArrayList<>();
    castRepo.findAll().forEach(allCasts::add);
    if (perfdate != 0) {
      allCasts.forEach(cast -> checkAbs(cast, perfdate));
    }
    return allCasts;
  }

  
  public void checkAbs(Cast p, long perfdate) {       
    p.getSubCasts().forEach( subcast -> {      
      subcast.getCastMembers().forEach(member -> {        
         Unavailability unavailability = unavailabilityService.getUnavailabilityByUserAndDate(member.getUser().getId(), new Date(perfdate));
         if (unavailability != null) {          
          member.setHasAbsence(true);
         }
      });
    });    
    
  }

  public List<Cast> getCastsBySectionId(int id) throws EntityNotFoundException, InvalidParameterException {
    Section section = sectionService.getSection(id);
    List<Cast> casts = castRepo.findAllBySection(section);

    return casts;
  }

  public ServiceResult<Cast> createCast(CastInfo newCast) throws InvalidParameterException,
      EntityNotFoundException {
    Cast cast = createNewCast(newCast);
    List<String> warnings = verifySubCasts(cast);

    cast = castRepo.save(cast);

    ServiceResult<Cast> result = new ServiceResult<>(cast, warnings);
    return result;
  }

  public ServiceResult<Cast> editCast(CastInfo newCast) throws InvalidParameterException,
      EntityNotFoundException {
    Cast cast = getCast(newCast.id()).toBuilder()
          .setName(newCast.name())
          .setNotes(newCast.notes())
          .build();
    
    // Update Cast Members
    List<SubCastInfo> subCastUpdates = newCast.subCasts();
    List<String> warnings = new ArrayList<>();
    if(subCastUpdates != null && !subCastUpdates.isEmpty()) {
      cast = updateSubCasts(cast, subCastUpdates);
      warnings = verifySubCasts(cast);
    }

    cast = castRepo.save(cast);

    ServiceResult<Cast> result = new ServiceResult<>(cast, warnings);
    return result;
  }

  // Helper Functions
  private Cast createNewCast(CastInfo newCast) throws EntityNotFoundException,
      InvalidParameterException {
    Section section = sectionService.getSection(newCast.sectionId());

    Cast cast = Cast.newBuilder()
        .setName(newCast.name())
        .setNotes(newCast.notes())
        .build();

    section.addCast(cast);

    if(newCast.subCasts() != null) {
      for(SubCastInfo subInfo: newCast.subCasts()) {
        SubCast subCast = new SubCast(subInfo.castNumber());
        section.getPositionById(subInfo.positionId()).addSubCast(subCast);
        cast.addSubCast(subCast);

        if(subInfo.members() != null) {
          for(CastMemberInfo memberInfo: subInfo.members()) {
            User user = userService.getUser(memberInfo.userId());
            CastMember member = new CastMember(user, memberInfo.order());
            subCast.addCastMember(member);
          }
        }
      }
    }

    return cast;
  }

  private Cast updateSubCasts(Cast cast, List<SubCastInfo> subCastUpdates) 
      throws InvalidParameterException, EntityNotFoundException {
    for(SubCastInfo updateInfo: subCastUpdates) {
      SubCast subCast;
      if(updateInfo.delete() != null && updateInfo.delete()) {
        // Delete SubCast
        if(updateInfo.id() == null) {
          throw new InvalidParameterException("Cannot delete Sub Cast before it is created.");
        }

        subCast = cast.getSubCastById(updateInfo.id());
        cast.removeSubCast(subCast);
        subCast.getPosition().removeSubCast(subCast);
      } else {
        if(updateInfo.id() == null) {
          // Create SubCast
          subCast = new SubCast(updateInfo.castNumber());
          cast.getSection().getPositionById(updateInfo.positionId()).addSubCast(subCast);
          cast.addSubCast(subCast);
        } else {
          // Edit SubCast
          subCast = cast.getSubCastById(updateInfo.id());
        }

        if(updateInfo.members() != null && !updateInfo.members().isEmpty()) {
          updateCastMembers(subCast, updateInfo.members());
        }
      }
    }

    return cast;
  }

  private void updateCastMembers(SubCast subCast, List<CastMemberInfo> castMemberUpdates) 
      throws InvalidParameterException, EntityNotFoundException {
    for(CastMemberInfo updateInfo: castMemberUpdates) {
      CastMember castMember;
      if(subCast.getId() != null && updateInfo.delete() != null && updateInfo.delete()) {
        // Delete CastMember 
        if(updateInfo.id() == null) {
          throw new InvalidParameterException("Cannot delete Cast Member before it is created.");
        }

        subCast.removeCastMember(subCast.getCastMemberById(updateInfo.id()));
      } else {
        if(updateInfo.id() == null) {
          // Create CastMember
          if(updateInfo.userId() == null || updateInfo.order() == null) {
            throw new InvalidParameterException("Cast Member must have a User id and an Order.");
          }

          User user = userService.getUser(updateInfo.userId());
          CastMember member = new CastMember(user, updateInfo.order());
          subCast.addCastMember(member);
        } else {
          // Edit CastMember
          castMember = subCast.getCastMemberById(updateInfo.id());
          castMember.setOrder(updateInfo.order());
          subCast.addCastMember(castMember);
        }
      }
    }
  }

  private List<String> verifySubCasts(Cast cast) throws EntityNotFoundException,
      InvalidParameterException {
    List<String> warnings = new ArrayList<>();

    Hashtable<Position,HashSet<Integer>> currentPositionsToCastNumbers = new Hashtable<>();
    Hashtable<Integer,HashSet<User>> currentCastNumbersToUsers = new Hashtable<>();
    for(SubCast subCast: cast.getSubCasts()) {
      // Check Sub Cast has position specific unique cast number
      Position currentPosition = subCast.getPosition();

      if(currentPositionsToCastNumbers.containsKey(currentPosition)) {
        HashSet<Integer> castNumbers = currentPositionsToCastNumbers.get(currentPosition);

        if(castNumbers.contains(subCast.getcastNumber())) {
          throw new InvalidParameterException(
              "Cannot have overlapping cast numbers for the same position.");
        }

        castNumbers.add(subCast.getcastNumber());
      } else {
        HashSet<Integer> newPosition = new HashSet<>();
        newPosition.add(subCast.getcastNumber());
        currentPositionsToCastNumbers.put(currentPosition, newPosition);
      }

      // Validate Cast Members for the Sub Cast
      if(!currentCastNumbersToUsers.containsKey(subCast.getcastNumber())) {
        currentCastNumbersToUsers.put(subCast.getcastNumber(), new HashSet<>());
      }

      Set<CastMember> members = subCast.getCastMembers();
      if(members != null) {
        List<String> memberWarnings = verifyCastMembers(
            currentCastNumbersToUsers.get(subCast.getcastNumber()), members,
            subCast.getcastNumber());

        warnings.addAll(memberWarnings);
      }
    }

    return warnings;
  }

  private List<String> verifyCastMembers(Set<User> usersInCast, Set<CastMember> members, int castNumber)
      throws InvalidParameterException {
    List<String> warnings = new ArrayList<>();

    HashSet<Integer> orders = new HashSet<>();
    for(CastMember member: members) {
      // Every Cast Member should have a unique order in the sub cast
      if(orders.contains(member.getOrder())) {
        throw new InvalidParameterException(
            "Order must be unique for each Cast Member in a SubCast.");
      }
      orders.add(member.getOrder());

      // All Cast Members should be unique by cast number: ie: 1st cast, 2nd cast
      User user = member.getUser();
      if(usersInCast.contains(user)) {
        warnings.add(String.format("%s %s appears multiple times in cast number %d",
            user.getFirstName(), user.getLastName(), castNumber + 1)); // Add one for readability
      }
      usersInCast.add(member.getUser());
    }

    return warnings;
  }

  public void deleteCast(int id) throws EntityNotFoundException {
    Optional<Cast> query = castRepo.findById(id);

    if(query.isEmpty()) {
      throw new EntityNotFoundException(String.format("No Cast with id %d", id));
    }

    Cast cast = query.get();
    Section section = cast.getSection();
    section.removeCast(cast);

    castRepo.delete(cast);
  }

  public CastServices(CastRepository castRepo, SectionServices sectionService,
      UserServices userService, UnavailabilityServices unavailabilityService) {
    this.castRepo = castRepo;
    this.userService = userService;
    this.sectionService = sectionService;
    this.unavailabilityService = unavailabilityService;
  }
}
