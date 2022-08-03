package com.google.rolecall.restcontrollers;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UnavailabilityInfo;
import com.google.rolecall.models.Unavailability;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Patch;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.UnavailabilityServices;
//import com.google.rolecall.services.UserServices;

import java.security.Principal;
import java.sql.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

/** Endpoints for manipulating Unavailability objects. */
@Endpoint(Constants.Mappings.UNAVAILABILITY_MANAGEMENT)
public class UnavailabilityManagement extends AsyncRestEndpoint {

  private final UnavailabilityServices unavailabilityService;
  //private final UserServices userService;

  /**
   * Gets all {@link Unavailability} objects that overlap the provided date.
   * 
   * @param startLong is the start date in miliseconds since the epoch
   * @param endLong is the end date in miliseconds since the epoch
   * 
   * @return List of {@link UnavailabilityInfo} objects.
   */  
  @Get({Constants.RequestParameters.START_DATE, Constants.RequestParameters.END_DATE})
  public CompletableFuture<ResponseSchema<List<UnavailabilityInfo>>> getAllUnavailable(
      @RequestParam(value=Constants.RequestParameters.START_DATE, required=true) long startLong,
      @RequestParam(value=Constants.RequestParameters.END_DATE, required=true) long endLong) {
    Date startDate = new Date(startLong);
    Date endDate = new Date(endLong);

    List<UnavailabilityInfo> allUnavailable = 
        unavailabilityService.getUnavailabilityByDateRange(startDate, endDate)
        .stream().map(u-> u.toUnavailabilityInfo())
        .collect(Collectors.toList());

    ResponseSchema<List<UnavailabilityInfo>> response = new ResponseSchema<>(allUnavailable);
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Creates a new {@link Unavailability} object.
   * 
   * @param info is the provided information for a new {@link Unavailability} object
   * 
   * @return {@link UnavailabilityInfo} of the saved object.
   * @throws InvalidParameterException if insufficienct properties are provided
   * @throws EntityNotFoundException if userId provided has no valid {@link User} object.
   */  
  @Post
  public CompletableFuture<ResponseSchema<UnavailabilityInfo>> createNewUnvailability(
    Principal principal, @RequestBody UnavailabilityInfo info) {

    if(info.userId() != getUser(principal).getId() && !getUser(principal).isAdmin()) {
      return  CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.ADMIN));
    }
  
    Unavailability unavailable;
    try {
      unavailable = unavailabilityService.createUnavailability(info);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<UnavailabilityInfo> response =
        new ResponseSchema<>(unavailable.toUnavailabilityInfo());
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Upadtes an existing {@link Unavailability} object.
   * 
   * @param info is the provided information for an existing {@link Unavailability} object
   * 
   * @return {@link UnavailabilityInfo} of the saved object.
   * @throws InvalidParameterException if insufficienct properties are provided
   * @throws EntityNotFoundException if id from info has no coresponding entity
   */  
  @Patch
  public CompletableFuture<ResponseSchema<UnavailabilityInfo>> editUnvailability(
      Principal principal, @RequestBody UnavailabilityInfo info) {

System.out.println(principal);
System.out.println(getUser(principal));

    if(info.userId() != getUser(principal).getId() && !getUser(principal).isAdmin()) {
      return  CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.ADMIN));
    }

    Unavailability unavailable;
    try {
      unavailable = unavailabilityService.editUnavailability(info);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<UnavailabilityInfo> response =
        new ResponseSchema<>(unavailable.toUnavailabilityInfo());
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Deletes an existing {@link Unavailability} object.
   * 
   * @param id of the {@link Unavailability} object to be deleted
   * 
   * @throws InvalidParameterException if id is null
   * @throws EntityNotFoundException if id has no coresponding entity
   */  
  @Delete(Constants.RequestParameters.UNAVAILABLE_ID)
  public CompletableFuture<Void> deleteUnavailability(
      Principal principal, 
      @RequestParam(value=Constants.RequestParameters.UNAVAILABLE_ID, required=true) 
      int id) {

    User user = getUser(principal);
    if(!user.isAdmin()) {
      Unavailability unav;
      try {
        unav = unavailabilityService.getUnavailability(id);
      } catch(EntityNotFoundException e) {
        return CompletableFuture.failedFuture(e);
      } catch(InvalidParameterException e) {
        return CompletableFuture.failedFuture(e);
      }
      if (unav.getUser().getId() != user.getId()) {
        return  CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.ADMIN));
      }
    }
    
    try {
      unavailabilityService.deleteUnavailability(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }
    
    return CompletableFuture.completedFuture(null);
  }

  public UnavailabilityManagement(UnavailabilityServices unavailabilityService) {
    this.unavailabilityService = unavailabilityService;
  }

}
