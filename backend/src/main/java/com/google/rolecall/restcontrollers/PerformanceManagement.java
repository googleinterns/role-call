package com.google.rolecall.restcontrollers;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.models.Performance;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.PerformanceServices;
import com.google.rolecall.services.ServiceResult;
import java.security.Principal;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Endpoint(Constants.Mappings.PERFORMANCE_MANAGEMENT)
public class PerformanceManagement extends AsyncRestEndpoint {
  
  private final PerformanceServices performanceService;

  @Get
  public CompletableFuture<ResponseSchema<List<PerformanceInfo>>> getAllPerformances() {
    List<Performance> allPerformances = performanceService.getAllPerformances();

    List<PerformanceInfo> performances = allPerformances.stream().map(p ->
        p.toPerformanceInfo()
        ).collect(Collectors.toList());

    ResponseSchema<List<PerformanceInfo>> response = new ResponseSchema<>(performances);
    return CompletableFuture.completedFuture(response);
  }

  public PerformanceManagement(PerformanceServices performanceService) {
    this.performanceService = performanceService;
  }

  @Get(Constants.RequestParameters.PERFORMANCE_ID)
  public CompletableFuture<ResponseSchema<PerformanceInfo>> getSingleSection(
      @RequestParam(value=Constants.RequestParameters.PERFORMANCE_ID, required=true) int id) {
    Performance performance;

    try {
      performance = performanceService.getPerformance(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<PerformanceInfo> response =
        new ResponseSchema<>(performance.toPerformanceInfo());
    return CompletableFuture.completedFuture(response);
  }

  @Post
  public CompletableFuture<ResponseSchema<PerformanceInfo>> createCast(Principal principal,
      @RequestBody PerformanceInfo newPerformance) {
    User currentUser = getUser(principal);
    if(!currentUser.isAdmin() && !currentUser.canManagePerformances()) {
      return CompletableFuture.failedFuture(
          insufficientPrivileges(Constants.Roles.MANAGE_PERFORMANCES));
    }

    ServiceResult<Performance> result;
    try {
      result = performanceService.createPerformance(newPerformance);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<PerformanceInfo> response = new ResponseSchema<>(
        result.getResult().toPerformanceInfo(),result.getWarnings());
    return CompletableFuture.completedFuture(response);
  }

  @Delete(Constants.RequestParameters.PERFORMANCE_ID)
  public CompletableFuture<Void> deleteCast(Principal principal, @RequestParam(
      value=Constants.RequestParameters.PERFORMANCE_ID, required=true) int id) {
    User currentUser = getUser(principal);
    if(!currentUser.isAdmin() && !currentUser.canManagePerformances()) {
      return CompletableFuture.failedFuture(
          insufficientPrivileges(Constants.Roles.MANAGE_PERFORMANCES));
    }

    try {
      performanceService.deletePerformance(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }
    
    return CompletableFuture.completedFuture(null);
  }
}
