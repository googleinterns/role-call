package com.google.rolecall.services;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

import com.google.rolecall.jsonobjects.UnavailabilityInfo;
import com.google.rolecall.models.Unavailability;
import com.google.rolecall.models.User;
import com.google.rolecall.repos.UnavailabilityRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import org.springframework.stereotype.Service;

@Service("unavailabilityService")
public class UnavailabilityServices {
  
  private final UnavailabilityRepository unavailabilityRepo;
  private final UserServices userService;

  public Unavailability getUnavailability(Integer id) throws EntityNotFoundException,
      InvalidParameterException {
    if (id == null) {
      throw new InvalidParameterException("Unavailability requires id");
    }

    Optional<Unavailability> queryResult = unavailabilityRepo.findById(id);

    if (!queryResult.isPresent()) {
        throw new EntityNotFoundException(String.format("UnavailabilityId %d does not exist", id));
    }

    return queryResult.get();
  }

  public List<Unavailability> getUnavailabilityByDateRange(Date startDate, Date endDate) {
    List<Unavailability> allUnavailabilities =
        unavailabilityRepo.findAllByStartDateLessThanEqualAndEndDateGreaterThanEqual(startDate,
        endDate);

    return allUnavailabilities;
  }

  public Unavailability createUnavailability(UnavailabilityInfo info)
      throws InvalidParameterException, EntityNotFoundException {
    Unavailability unavailable = Unavailability.newBuilder()
        .setDescription(info.description())
        .setStartDate(info.startDate())
        .setEndDate(info.endDate())
        .build();

    User user = userService.getUser(info.userId());
    user.addUnavailability(unavailable);

    return unavailabilityRepo.save(unavailable);
  }

  public Unavailability editUnavailability(UnavailabilityInfo info)
      throws InvalidParameterException, EntityNotFoundException {
    Unavailability unavailable = getUnavailability(info.id())
        .toBuilder()
        .setDescription(info.description())
        .setStartDate(info.startDate())
        .setEndDate(info.endDate())
        .build();

    return unavailabilityRepo.save(unavailable);
  }

  public void deleteUnavailability(Integer id) 
      throws InvalidParameterException, EntityNotFoundException {
    Unavailability unavailable = getUnavailability(id);
    unavailabilityRepo.delete(unavailable);
  }

  public UnavailabilityServices(UnavailabilityRepository unavailabilityRepo,
      UserServices userService) {
    this.unavailabilityRepo = unavailabilityRepo;
    this.userService = userService;
  }
}
