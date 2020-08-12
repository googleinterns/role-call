package com.google.rolecall.repos;

import java.util.List;
import java.util.Optional;

import com.google.rolecall.models.Cast;
import com.google.rolecall.models.Section;

import org.springframework.data.repository.CrudRepository;

/* Enitity for accessing and updating Cast objects stored in a database. */
public interface CastRepository extends CrudRepository<Cast, Integer> {

  public List<Cast> findAllBySection(Section section);

  public Optional<Cast> findFirstBySection(Section section);
}
