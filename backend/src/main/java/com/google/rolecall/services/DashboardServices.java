package com.google.rolecall.services;

import com.google.rolecall.models.TruncatedPerformance;
import com.google.rolecall.models.User;
import com.google.rolecall.models.Performance.Status;
import com.google.rolecall.repos.TruncatedPerformanceRepository;
import com.google.rolecall.repos.UserRelatedPerformanceRepository;

import java.util.ArrayList;
import java.util.function.Predicate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("dashboardServices")
@Transactional(rollbackFor = Exception.class)
public class DashboardServices {

  private final TruncatedPerformanceRepository truncatedPerformanceRepo;
  private final UserRelatedPerformanceRepository userRelatedPerformanceRepo;

  public List<TruncatedPerformance> getRelevantPerformances(User user) {
    List<TruncatedPerformance> performances = new ArrayList<>();

    if(user.isAdmin() || user.canManagePerformances()) {
      truncatedPerformanceRepo.findAll().forEach(performances::add);
    } else {
      userRelatedPerformanceRepo.findAllByUser(user).stream().map(u -> u.getPerformance())
          .filter(new Predicate<TruncatedPerformance>() 
          {
            @Override
            public boolean test(TruncatedPerformance performance) {
              return performance.getStatus() == Status.Published;
            }
          }).collect(Collectors.toSet()).forEach(performances::add);
    }

    return performances;
  }
  
  public DashboardServices(TruncatedPerformanceRepository truncatedPerformanceRepo,
      UserRelatedPerformanceRepository userRelatedPerformanceRepo) {
    this.truncatedPerformanceRepo = truncatedPerformanceRepo;
    this.userRelatedPerformanceRepo = userRelatedPerformanceRepo;
  }
}
