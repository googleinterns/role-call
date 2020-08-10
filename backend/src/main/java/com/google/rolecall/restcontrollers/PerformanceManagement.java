package com.google.rolecall.restcontrollers;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.PerformanceInfo;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.models.Performance;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.services.PerformanceServices;

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
}