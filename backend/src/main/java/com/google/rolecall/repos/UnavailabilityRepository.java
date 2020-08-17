package com.google.rolecall.repos;

import java.sql.Date;
import java.util.List;

import com.google.rolecall.models.Unavailability;

import org.springframework.data.repository.CrudRepository;

public interface UnavailabilityRepository extends CrudRepository<Unavailability, Integer> {
  
  public List<Unavailability> findAllByStartDateLessThanEqualAndEndDateGreaterThanEqual(Date startDate, Date endDate);

}
