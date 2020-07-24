package com.google.rolecall.repos;

import com.google.rolecall.models.Section;
import org.springframework.data.repository.CrudRepository;

/* Enitity for accessing and updating Section objects stored in a database. */
public interface SectionRepository extends CrudRepository<Section, Integer> {
}
