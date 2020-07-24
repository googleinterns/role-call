package com.google.rolecall.repos;

import com.google.rolecall.models.Cast;
import org.springframework.data.repository.CrudRepository;

/* Enitity for accessing and updating Cast objects stored in a database. */
public interface CastRepository extends CrudRepository<Cast, Integer> {
}
