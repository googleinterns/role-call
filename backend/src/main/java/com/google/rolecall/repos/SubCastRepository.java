package com.google.rolecall.repos;

import java.util.Optional;

import com.google.rolecall.models.Position;
import com.google.rolecall.models.SubCast;
import org.springframework.data.repository.CrudRepository;

public interface SubCastRepository extends CrudRepository<SubCast, Integer> {

  public Optional<SubCast> findFirstByPosition(Position position);
}
