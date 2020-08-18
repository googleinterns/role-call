package com.google.rolecall.restcontrollers;

import java.sql.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UnavailabilityInfo;
import com.google.rolecall.models.Unavailability;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Patch;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.UnavailabilityServices;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Endpoint(Constants.Mappings.UNAVAILABILITY_MANAGEMENT)
public class UnavailabilityManagement extends AsyncRestEndpoint {

  private final UnavailabilityServices unavailabilityService;
  
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

  @Post
  public CompletableFuture<ResponseSchema<UnavailabilityInfo>> createNewUnvailability(
      @RequestBody UnavailabilityInfo info) {

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

  @Patch
  public CompletableFuture<ResponseSchema<UnavailabilityInfo>> editUnvailability(
      @RequestBody UnavailabilityInfo info) {

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

  @Delete(Constants.RequestParameters.UNAVAILABLE_ID)
  public CompletableFuture<Void> deleteSection(@RequestParam(value=Constants.RequestParameters.UNAVAILABLE_ID, required=true) 
      int id) {
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