package com.google.rolecall.repos;

import java.util.Optional;

import com.google.rolecall.models.PerformanceCastMember;
import com.google.rolecall.models.Position;
import com.google.rolecall.models.User;

import org.springframework.data.repository.CrudRepository;

public interface PerformanceCastMemberRepository 
    extends CrudRepository<PerformanceCastMember, Integer>{
  
  public Optional<PerformanceCastMember> findFirstByUser(User user);

  public Optional<PerformanceCastMember> findFirstByPosition(Position position);
}
