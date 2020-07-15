package com.google.rolecall;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.core.env.Environment;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(MockitoExtension.class)
@ExtendWith(SpringExtension.class)
public class ApplicationLoaderUnitTests {

  private Environment env;
  private UserRepository userRepo;
  private ApplicationLoader loader;

  @BeforeEach
  public void init() {
    userRepo = mock(UserRepository.class);
    env = mock(Environment.class);
    loader = new ApplicationLoader(env, userRepo);
    User user = new User("admin", "admin", "adminEmail", null, "", "", "", true);
    lenient().when(userRepo.findByFirstNameAndLastNameAndEmailIgnoreCase("admin", "admin", "adminEmail")).thenReturn(Optional.of(user));
    lenient().when(userRepo.findByFirstNameAndLastNameAndEmailIgnoreCase("new", "new", "newEmail")).thenReturn(Optional.empty());
  }

  @Test
  public void adminExists_success() throws Exception {
    // Mock
    lenient().when(env.getProperty("admin.first.name")).thenReturn("admin");
    lenient().when(env.getProperty("admin.last.name")).thenReturn("admin");
    lenient().when(env.getProperty("admin.email")).thenReturn("adminEmail");

    // Execute
    loader.run(new DefaultApplicationArguments(new String[]{}));
    
    // Assert
    verify(userRepo, never()).save(any(User.class));
  }

  @Test
  public void adminDoesNotExists_success() throws Exception {
    // Setup
    ArgumentCaptor<User> arg = ArgumentCaptor.forClass(User.class);
    
    // Mock
    lenient().when(env.getProperty("admin.first.name")).thenReturn("new1");
    lenient().when(env.getProperty("admin.last.name")).thenReturn("new2");
    lenient().when(env.getProperty("admin.email")).thenReturn("newEmail");
    lenient().when(userRepo.save(any(User.class))).thenReturn(new User());

    // Execute
    loader.run(new DefaultApplicationArguments(new String[]{}));
    
    // Assert
    verify(userRepo, times(1)).save(arg.capture());
    assert(arg.getValue().getFirstName()).equals("new1");
    assert(arg.getValue().getLastName()).equals("new2");
    assert(arg.getValue().getEmail()).equals("newEmail");
  }
}
