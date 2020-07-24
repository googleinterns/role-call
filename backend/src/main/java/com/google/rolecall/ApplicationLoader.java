package com.google.rolecall;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/* Methods to be run before and after the server loads. */
@Component
public class ApplicationLoader implements ApplicationRunner {

  private Logger logger = Logger.getLogger(ApplicationLoader.class.getName());
  
  private final Environment environment;
  private final UserRepository userRepo;
  private String adminFirstName;
  private String adminLastName;
  private String adminEmail;

  @Profile({"dev","prod"})
  @Override
  public void run(ApplicationArguments args) throws Exception {
    // Initialize admin if exists, or create one with given information.
    adminFirstName = environment.getProperty("admin.first.name");
    adminLastName = environment.getProperty("admin.last.name");
    adminEmail = environment.getProperty("admin.email");
    
    Optional<User> possibleAdmin = userRepo.findByEmailIgnoreCase(adminEmail);
        
    possibleAdmin.ifPresentOrElse(this::adminExists, this::createAdmin);
  }

  private void adminExists(User user) {
    logger.log(Level.INFO, String.format("Admin User already exists: %s %s %s", 
        user.getFirstName(), user.getLastName(), user.getEmail()));
  }

  private void createAdmin() {
    User admin;
    try {
      admin = User.newBuilder()
          .setFirstName(adminFirstName)
          .setLastName(adminLastName)
          .setEmail(adminEmail)
          .setIsActive(true)
          .setCanLogin(true)
          .setAdmin(true)
          .build();
    } catch(InvalidParameterException e) {
      logger.log(Level.SEVERE, "Unable to Create admin. Insufficient Properties.");
      return;
    }
    userRepo.save(admin);
    logger.log(Level.WARNING, String.format("Admin User Created: %s %s %s", 
        adminFirstName, adminLastName, adminEmail));
  }

  @Autowired
  public ApplicationLoader(Environment env, UserRepository userRepo) {
    this.environment = env;
    this.userRepo = userRepo;
  }
}
