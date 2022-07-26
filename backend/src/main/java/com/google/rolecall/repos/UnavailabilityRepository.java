package com.google.rolecall.repos;

import com.google.rolecall.models.Unavailability;
import java.sql.Date;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface UnavailabilityRepository extends CrudRepository<Unavailability, Integer> {
    @Query(nativeQuery = true, value = "select * from #{#entityName} where user_id = ?1 and endDate >= ?2 and startDate <= ?2 limit 1")
    Unavailability getUnavailabilityByUserAndDate(Integer userId, Date date);
  
}
