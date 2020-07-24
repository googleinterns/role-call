package com.google.rolecall.services;

import com.google.rolecall.jsonobjects.CastInfo;
import com.google.rolecall.jsonobjects.CastMemberInfo;
import com.google.rolecall.models.Cast;
import com.google.rolecall.models.CastMember;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.CastRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;

@Service("castServices")
public class CastServices {
  
  private final CastRepository castRepo;
  private final UserServices userService;
  private final PositionServices positionService;

  public List<Cast> getAllCasts() {
    List<Cast> allCasts = new ArrayList<>();
    castRepo.findAll().forEach(allCasts::add);

    return allCasts;
  }

  public List<Cast> getCastsByPositionId(int id) throws EntityNotFoundException {
    Position position = positionService.getPosition(id);

    return position.getCasts();
  }

  public Cast getCastById(int id) throws EntityNotFoundException {
    Optional<Cast> query = castRepo.findById(id);

    if(query.isEmpty()) {
      throw new EntityNotFoundException(String.format("No cast with id %id", id));
    }

    return query.get();
  }

  public Cast createCast(CastInfo newCast) throws InvalidParameterException,
      EntityNotFoundException {
    if(newCast.positionId() == null) {
      throw new InvalidParameterException("Cast requires a Position id");
    }

    Cast cast = Cast.newBuilder()
        .setName(newCast.name())
        .setComments(newCast.comments())
        .setColor(newCast.color())
        .build();
    
    Position position = positionService.getPosition(newCast.positionId());
    position.addCast(cast);

    if(newCast.members() != null && !newCast.members().isEmpty()) {
      addNewCastMembers(cast, newCast.members());
    }

    return castRepo.save(cast);
  }

  public Cast editCast(CastInfo newCast) throws InvalidParameterException,
      EntityNotFoundException {
    Cast cast = getCastById(newCast.id()).toBuilder()
          .setName(newCast.name())
          .setComments(newCast.comments())
          .setColor(newCast.color())
          .build();
    
    // Update Cast Members
    List<CastMemberInfo> castMemberUpdates = newCast.members();
    if(castMemberUpdates != null && !castMemberUpdates.isEmpty()) {
      List<CastMember> currentMembers = cast.getCastMembers();
      for(CastMemberInfo info: castMemberUpdates) {
        if(info.delete() != null && info.delete()) {
          if(info.id() == null) {
            throw new InvalidParameterException("Cannot delete CastMember before it is created.");
          }
          cast.removeCastMember(getCastMemberById(info.id(), currentMembers));
        } else {
          if(info.userId() == null) {
            throw new InvalidParameterException("Cast member cannot have null user ID.");
          }
          User user = userService.getUser(info.userId());
          cast.addCastMember(user);
        }
      }

      Set<Integer> uniqueUsers = new HashSet<>();
      for(CastMember member: currentMembers) {
        Integer id = member.getUser().getId();
        if(id == null) {
          throw new InvalidParameterException("Cast member cannot have null user ID.");
        }
        uniqueUsers.add(id);
      }
    }

    return castRepo.save(cast);
  }

  public void deleteCast(int id) throws EntityNotFoundException {
    getCastById(id);
    castRepo.deleteById(id);
  }

  private void addNewCastMembers(Cast cast, List<CastMemberInfo> members)
      throws EntityNotFoundException, InvalidParameterException {
    // Assert all potential users are unique
    Set<Integer> uniqueUsers = new HashSet<>();
    for(CastMemberInfo info: members) {
      if(info.userId() == null) {
        throw new InvalidParameterException("Cast member cannot have null user ID.");
      }
      if(uniqueUsers.contains(info.userId())) {
        throw new InvalidParameterException("All Users in a cast must be unique.");
      }
      uniqueUsers.add(info.userId());
    }

    // Assert User exist
    for(CastMemberInfo info: members) {
      User user = userService.getUser(info.userId());
      cast.addCastMember(user);
    }
  }

  private CastMember getCastMemberById(int id, List<CastMember> members) 
      throws EntityNotFoundException {
    for(CastMember member: members) {
      if(member.getId() == id) {
        return member;
      }
    }
    throw new EntityNotFoundException(String.format(
        "No Cast Member with id %d exists in the cast", id));
  }

  public CastServices(CastRepository castRepo, PositionServices positionService,
      UserServices userService) {
    this.castRepo = castRepo;
    this.userService = userService;
    this.positionService = positionService;
  }
}
