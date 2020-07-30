package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.SubCastInfo;
import com.google.rolecall.jsonobjects.CastInfo;
import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.models.Cast;
import com.google.rolecall.models.CastMember;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.Section;
import com.google.rolecall.models.SubCast;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("castServices")
public class CastServices {
  
  private final CastRepository castRepo;
  private final UserServices userService;
  private final SectionServices sectionService;

  @Transactional
  public List<Cast> getAllCasts() {
    List<Cast> allCasts = new ArrayList<>();
    castRepo.findAll().forEach(allCasts::add);

    return allCasts;
  }

  @Transactional
  public List<Cast> getCastsBySectionId(int id) throws EntityNotFoundException {
    Section section = sectionService.getSection(id);

    return section.getCasts();
  }

  @Transactional
  public Cast createCast(CastInfo newCast) throws InvalidParameterException,
      EntityNotFoundException {
    creatCastCheckCastValidity(newCast);

    Section section = sectionService.getSection(newCast.sectionId());
    List<Position> positions = section.getPositions();

    Cast cast = Cast.newBuilder()
        .setName(newCast.name())
        .setNotes(newCast.notes())
        .build();

    section.addCast(cast);

    if(newCast.subCasts() != null) {
      for(SubCastInfo subInfo: newCast.subCasts()) {
        SubCast subCast = new SubCast(subInfo.castNumber());
        sectionService.getPositionById(subInfo.positionId(), positions).addSubCast(subCast);
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

    return castRepo.save(cast);
  }

  private void creatCastCheckCastValidity(CastInfo newCast) throws InvalidParameterException {
    if(newCast.sectionId() == null) {
      throw new InvalidParameterException("Cast requires a Section");
    }

    if(newCast.subCasts() != null) {
      createCastCheckSubCastValidity(newCast.subCasts());
    }
  }

  private void createCastCheckSubCastValidity(List<SubCastInfo> subCastInfos)
      throws InvalidParameterException {
    Hashtable<Integer,HashSet<Integer>> currentPositionsToCastNumbers = new Hashtable<>();
    Hashtable<Integer,HashSet<Integer>> currentCastNumbersToUsers = new Hashtable<>();
    for(SubCastInfo subCast: subCastInfos) {
      // Check Sub cast for null values
      if(subCast.castNumber() == null || subCast.positionId() == null) {
        throw new InvalidParameterException("SubCast requires a Cast Number and a Position");
      }

      // Check Sub Cast has position specific unique cast number
      if(currentPositionsToCastNumbers.containsKey(subCast.positionId())) {
        HashSet<Integer> castNumbers = currentPositionsToCastNumbers.get(subCast.positionId());
        if(castNumbers.contains(subCast.castNumber())) {
          throw new InvalidParameterException(
              "Cannot have overlapping cast numbers for the same position.");
        }
        castNumbers.add(subCast.castNumber());
      } else {
        HashSet<Integer> newPosition = new HashSet<>();
        newPosition.add(subCast.castNumber());
        currentPositionsToCastNumbers.put(subCast.positionId(), newPosition);
      }

      // Validate Cast Members for the Sub Cast
      if(!currentCastNumbersToUsers.containsKey(subCast.castNumber())) {
        currentCastNumbersToUsers.put(subCast.castNumber(), new HashSet<>());
      }

      if(subCast.members() != null) {
        createCastCheckCastMemberValidity(currentCastNumbersToUsers.get(subCast.castNumber()),
            subCast.members());
      }
    }
  }

  private void createCastCheckCastMemberValidity(
      HashSet<Integer> currentCastMembers, List<CastMemberInfo> members)
      throws InvalidParameterException {
    HashSet<Integer> orders = new HashSet<>();
    for(CastMemberInfo member: members) {
      // Chack Cast Members for null values
      if(member.userId() == null || member.order() == null) {
        throw new InvalidParameterException("Cast Member must have a User id and an Order.");
      }

      // Every Cast Member should have a unique order in the sub cast
      if(orders.contains(member.order())) {
        throw new InvalidParameterException(
            "Order must be unique for each Cast Member in a SubCast.");
      }
      orders.add(member.order());

      // All Cast Members should be unique by cast number: ie: 1st cast, seconc cast
      if(currentCastMembers.contains(member.userId())) {
        throw new InvalidParameterException(
          "Each cast must contain only unique Users.");
      }
      currentCastMembers.add(member.userId());
    }
  }

  // public Cast editCast(SubCastInfo newCast) throws InvalidParameterException,
  //     EntityNotFoundException {
  //   Cast cast = getCastById(newCast.id()).toBuilder()
  //         .setName(newCast.name())
  //         .setComments(newCast.comments())
  //         .setColor(newCast.color())
  //         .build();
    
  //   // Update Cast Members
  //   List<CastMemberInfo> castMemberUpdates = newCast.members();
  //   if(castMemberUpdates != null && !castMemberUpdates.isEmpty()) {
  //     List<CastMember> currentMembers = cast.getCastMembers();
  //     for(CastMemberInfo info: castMemberUpdates) {
  //       if(info.delete() != null && info.delete()) {
  //         if(info.id() == null) {
  //           throw new InvalidParameterException("Cannot delete CastMember before it is created.");
  //         }
  //         cast.removeCastMember(getCastMemberById(info.id(), currentMembers));
  //       } else {
  //         if(info.userId() == null) {
  //           throw new InvalidParameterException("Cast member cannot have null user ID.");
  //         }
  //         User user = userService.getUser(info.userId());
  //         cast.addCastMember(user);
  //       }
  //     }

  //     Set<Integer> uniqueUsers = new HashSet<>();
  //     for(CastMember member: currentMembers) {
  //       Integer id = member.getUser().getId();
  //       if(id == null) {
  //         throw new InvalidParameterException("Cast member cannot have null user ID.");
  //       }
  //       uniqueUsers.add(id);
  //     }
  //   }

  //   return castRepo.save(cast);
  // }

  // public void deleteCast(int id) throws EntityNotFoundException {
  //   Cast cast = getCastById(id);
  //   try {
  //     Position position = cast.getPosition();
  //     position.removeCast(cast);
  //     positionService.updatePosition(position);
  //   } catch(InvalidParameterException e) {
  //     throw new Error("Database inconsitency. Cast maps to no position.");
  //   }
  // }

  // private void addNewCastMembers(Cast cast, List<CastMemberInfo> members)
  //     throws EntityNotFoundException, InvalidParameterException {
  //   // Assert all potential users are unique
  //   Set<Integer> uniqueUsers = new HashSet<>();
  //   for(CastMemberInfo info: members) {
  //     if(info.userId() == null) {
  //       throw new InvalidParameterException("Cast member cannot have null user ID.");
  //     }
  //     if(uniqueUsers.contains(info.userId())) {
  //       throw new InvalidParameterException("All Users in a cast must be unique.");
  //     }
  //     uniqueUsers.add(info.userId());
  //   }

  //   // Assert User exist
  //   for(CastMemberInfo info: members) {
  //     User user = userService.getUser(info.userId());
  //     cast.addCastMember(user);
  //   }
  // }

  // private CastMember getCastMemberById(int id, List<CastMember> members) 
  //     throws EntityNotFoundException {
  //   for(CastMember member: members) {
  //     if(member.getId() == id) {
  //       return member;
  //     }
  //   }
  //   throw new EntityNotFoundException(String.format(
  //       "No Cast Member with id %d exists in the cast", id));
  // }

  public CastServices(CastRepository castRepo, SectionServices sectionService,
      UserServices userService) {
    this.castRepo = castRepo;
    this.userService = userService;
    this.sectionService = sectionService;
  }
}
