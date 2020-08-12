package com.google.rolecall.repos;

import com.google.rolecall.models.TruncatedPerformance;
import org.springframework.data.repository.CrudRepository;

public interface TruncatedPerformanceRepository 
    extends CrudRepository<TruncatedPerformance, Integer> {
}
