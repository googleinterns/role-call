package com.google.rolecall.services;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.util.CustomUserDetail;
import java.util.Optional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("userDetailService")
@Transactional
public class CustomUserDetailService implements UserDetailsService {

  private final UserRepository userRepo;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Optional<User> query = userRepo.findByEmailIgnoreCase(email);
    if(query.isEmpty()) {
      throw new UsernameNotFoundException(String.format("User with email %s does not exist",
          email));
    }
    User user = query.get();

    CustomUserDetail detailedUser = CustomUserDetail.build(user);

    return detailedUser;
  }

  public CustomUserDetailService(UserRepository userRepo) {
    this.userRepo = userRepo;
  }
}
