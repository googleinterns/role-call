package com.google.rolecall.repos;

import com.google.rolecall.models.Position;
import org.springframework.data.repository.CrudRepository;

/* Enitity for accessing and updating Position objects stored in a database. */
public interface PositionRepository extends CrudRepository<Position, Integer> {
}
