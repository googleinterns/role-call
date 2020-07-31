package com.google.rolecall.repos;

import java.util.Optional;

import com.google.rolecall.models.CastMember;
import com.google.rolecall.models.User;

import org.springframework.data.repository.CrudRepository;

public interface CastMemberRepository extends CrudRepository<CastMember, Integer> {

  public Optional<CastMember> findFirstByUser(User user);

}
