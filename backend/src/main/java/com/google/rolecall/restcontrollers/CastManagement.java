package com.google.rolecall.restcontrollers;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.CastInfo;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.models.Cast;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Patch;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.CastServices;
import com.google.rolecall.services.ServiceResult;
import java.security.Principal;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Endpoint(Constants.Mappings.CAST_MANAGEMENT)
public class CastManagement extends AsyncRestEndpoint {
  
  private final CastServices castService;

  @Get
  public CompletableFuture<ResponseSchema<List<CastInfo>>> getAllCasts() {
    List<CastInfo> allCasts = castService.getAllCasts().stream().map(c->c.toCastInfo())
        .collect(Collectors.toList());

    ResponseSchema<List<CastInfo>> response = new ResponseSchema<>(allCasts);
    return CompletableFuture.completedFuture(response);
  }

  @Get(Constants.RequestParameters.SECTION_ID)
  public CompletableFuture<ResponseSchema<List<CastInfo>>> getAllCastsForSection(@RequestParam(
         value=Constants.RequestParameters.SECTION_ID, required=true) int id) {
    List<CastInfo> casts;

    try { 
      casts = castService.getCastsBySectionId(id).stream().map(c->c.toCastInfo())
          .collect(Collectors.toList());
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<List<CastInfo>> response = new ResponseSchema<>(casts);
    return CompletableFuture.completedFuture(response);
  }

  @Post
  public CompletableFuture<ResponseSchema<CastInfo>> createCast(Principal principal,
      @RequestBody CastInfo newCast) {
    User currentUser = getUser(principal);
    if(!currentUser.isAdmin() && !currentUser.canManageCasts()) {
      return CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.MANAGE_CASTS));
    }
    
    ServiceResult<Cast> result;
    try {
      result = castService.createCast(newCast);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<CastInfo> response = new ResponseSchema<>(result.getResult().toCastInfo(),
        result.getWarnings());
    return CompletableFuture.completedFuture(response);
  }

  @Patch
  public CompletableFuture<ResponseSchema<CastInfo>> editCast(Principal principal,
      @RequestBody CastInfo cast) {
    User currentUser = getUser(principal);
    if(!currentUser.isAdmin() && !currentUser.canManageCasts()) {
      return CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.MANAGE_CASTS));
    }

    ServiceResult<Cast> result;
    try {
      result = castService.editCast(cast);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<CastInfo> response = new ResponseSchema<>(result.getResult().toCastInfo(),
        result.getWarnings());
    return CompletableFuture.completedFuture(response);
  }

  @Delete(Constants.RequestParameters.CAST_ID)
  public CompletableFuture<Void> deleteCast(Principal principal, @RequestParam(
      value=Constants.RequestParameters.CAST_ID, required=true) int id) {
    User currentUser = getUser(principal);
    if(!currentUser.isAdmin() && !currentUser.canManageCasts()) {
      return CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.MANAGE_CASTS));
    }

    try {
      castService.deleteCast(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }
    
    return CompletableFuture.completedFuture(null);
  }

  public CastManagement(CastServices castService) {
    this.castService = castService;
  }
}
