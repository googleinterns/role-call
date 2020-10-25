package com.google.rolecall.restcontrollers;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.DashboardInfo;
import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.services.DashboardServices;

import java.security.Principal;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/** Endpoints to populate the dashbaord. */ 
@Endpoint(Constants.Mappings.DASHBOARD_MANAGEMENT)
public class DashboardManagement extends AsyncRestEndpoint {

  private final DashboardServices dashboardService;

   /**
   * Gets the dashboard information relevant to the current user
   * 
   * @return User specific {@link DashboardInfo} object
   */ 
  @Get
  public CompletableFuture<ResponseSchema<DashboardInfo>> getAllCasts(Principal principal) {
    User currentUser = getUser(principal);

    List<PerformanceInfo> performances = dashboardService.getRelevantPerformances(currentUser)
        .stream()
        .map(p->p.toPerformanceInfo()).collect(Collectors.toList());

    DashboardInfo result = DashboardInfo.newBuilder()
        .setPerformances(performances)
        .build();

    ResponseSchema<DashboardInfo> response = new ResponseSchema<>(result);
    return CompletableFuture.completedFuture(response);
  }

  public DashboardManagement(DashboardServices dashboardService) {
    this.dashboardService = dashboardService;
  }
  
}