package com.google.rolecall.repos;

import java.util.Optional;

import com.google.rolecall.models.PerformanceSection;
import com.google.rolecall.models.Section;

import org.springframework.data.repository.CrudRepository;

public interface PerformanceSectionRepository extends CrudRepository<PerformanceSection, Integer> {

  public Optional<PerformanceSection> findFirstBySection(Section section);
}
