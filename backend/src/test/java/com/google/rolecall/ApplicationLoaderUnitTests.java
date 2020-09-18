package com.google.rolecall;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
    User.Builder builder = User.newBuilder()
        .setFirstName("admin")
        .setLastName("admin")
        .setEmail("adminEmail")
        .setIsAdmin(true);
    User user;
    try {
      user = builder.build();
    } catch(InvalidParameterException e) {
      throw new Error("Unable to creat User");
    }
    lenient().when(userRepo.findByEmailIgnoreCase("adminEmail")).thenReturn(Optional.of(user));
    lenient().when(userRepo.findByEmailIgnoreCase("newEmail")).thenReturn(Optional.empty());
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
    // Mock
    lenient().when(env.getProperty("admin.first.name")).thenReturn("new1");
    lenient().when(env.getProperty("admin.last.name")).thenReturn("new2");
    lenient().when(env.getProperty("admin.email")).thenReturn("newEmail@email.com");
    lenient().when(userRepo.save(any(User.class))).thenReturn(new User());

    // Execute
    loader.run(new DefaultApplicationArguments(new String[]{}));
    
    // Assert
    verify(userRepo, times(1)).save(any(User.class));
  }

  @Test
  public void adminDoesNotExistsUnexpectedAdmin_failure() throws Exception {
    // Mock
    lenient().when(env.getProperty("admin.first.name")).thenReturn(null);
    lenient().when(env.getProperty("admin.last.name")).thenReturn(null);
    lenient().when(env.getProperty("admin.email")).thenReturn(null);
    lenient().when(userRepo.save(any(User.class))).thenReturn(new User());

    // Execute
    loader.run(new DefaultApplicationArguments(new String[]{}));
    
    // Assert
    verify(userRepo, never()).save(any(User.class));
  }
}
