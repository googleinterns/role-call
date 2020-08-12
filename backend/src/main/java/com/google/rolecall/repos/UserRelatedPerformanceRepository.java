package com.google.rolecall.repos;

import java.util.List;

import com.google.rolecall.models.User;
import com.google.rolecall.models.UserRelatedPerformance;
import org.springframework.data.repository.CrudRepository;

public interface UserRelatedPerformanceRepository 
    extends CrudRepository<UserRelatedPerformance, Integer> {  

  public List<UserRelatedPerformance> findAllByUser(User user);
}
