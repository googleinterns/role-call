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
    // Look for valid position id
    if(newCast.positionId() == null) {
      throw new InvalidParameterException("Cast requires a Position id");
    }
    if(newCast.members() == null) {
      throw new InvalidParameterException("Members cannot be null");
    }
    // Assert all potential users are unique
    Set<Integer> uniqueUsers = new HashSet<>();
    for(CastMemberInfo info: newCast.members()) {
      if(info.userId() == null) {
        throw new InvalidParameterException("Cast member cannot have null user ID.");
      }
      if(uniqueUsers.contains(info.userId())) {
        throw new InvalidParameterException("All Users in a cast must be unique.");
      }
      uniqueUsers.add(info.userId());
    }
    // Assert valid Cast parameters
    Cast cast = Cast.newBuilder()
        .setName(newCast.name())
        .setComments(newCast.comments())
        .setColor(newCast.color())
        .build();
    
    // Validate objects in the database
    Position position = positionService.getPosition(newCast.positionId());

    for(CastMemberInfo info: newCast.members()) {
      User user = userService.getUser(info.userId());
      cast.addCastMember(user);
    }

    position.addCast(cast);

    return castRepo.save(cast);
  }

  public CastServices(CastRepository castRepo, PositionServices positionService,
      UserServices userService) {
    this.castRepo = castRepo;
    this.userService = userService;
    this.positionService = positionService;
  }
}
