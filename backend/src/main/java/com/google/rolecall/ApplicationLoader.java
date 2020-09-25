package com.google.rolecall;

import com.google.rolecall.models.User;
import com.google.rolecall.repos.UserRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
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
          .setIsAdmin(true)
          .build();
    } catch(InvalidParameterException e) {
      logger.log(Level.SEVERE, "Unable to Create admin. Insufficient Properties.");
      return;
    }
    userRepo.save(admin);
    logger.log(Level.WARNING, String.format("Admin User Created: %s %s %s", 
        adminFirstName, adminLastName, adminEmail));
    createTestData();
  }

  // Create sample data
  
  private enum DataCreateError {
    OK,
    OtherError
  }

  private DataCreateError createOneUser(String fName, String lName, String email, String dateJoined) {
    Calendar cal = Calendar.getInstance();
    SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy", Locale.US);
    User user;
    try {
      cal.setTime(sdf.parse(dateJoined));

      user = User.newBuilder()
          .setFirstName(fName)
          .setLastName(lName)
          .setEmail(email)
          .setDateJoined(cal)
          .setIsActive(true)
          .setCanLogin(true)
          .setIsDancer(true)
          .build();
      userRepo.save(user);
    } catch(InvalidParameterException e) {
      return DataCreateError.OtherError;
    } catch(ParseException e) {
      return DataCreateError.OtherError;
    }
    return DataCreateError.OK;
  }

  private DataCreateError createTestData() {
    logger.log(Level.WARNING, "Creating test data.");    
    Boolean finished = false;
    while (!finished) {
      if(DataCreateError.OK != createOneUser("Robert", "Battle", "rb@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jeroboam", "Bozeman", "bb@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Clifton", "Brown", "cb@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Khalia", "Campbell", "kc@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Patrick", "Coker", "pc@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Sarah", "Daley", "sd@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Ghrai", "Devore", "gde@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Solomon", "Dumas", "sdu@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Ronni", "Favors", "rf@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Samantha", "Figgins", "sf@gmail.com","1/1/2020")) break;

      if(DataCreateError.OK != createOneUser("James", "Gilmer", "jg@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Vernard", "Gilmore", "vg@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jacqueline", "Green", "jgr@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jacquelin", "Harris", "jh@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Michael", "Jackson", "mj@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Yazzmeen", "Laidler", "yl@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Yannick", "Lebrun", "yle@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Constance", "Lopez", "csl@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Renaldo", "Maurice", "rm@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Corrin", "Mitchell", "crm@gmail.com","1/1/2020")) break;

      if(DataCreateError.OK != createOneUser("Chalvar", "Monteiro", "cm@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Belen", "Pereyra", "bp@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jessica", "Pinkett", "jap@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Miranda", "Quinn", "mq@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jamar", "Roberts", "jr@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Matthew", "Rushing", "mr@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Kanji", "Segawa", "ks@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Courtney", "Spears", "ccs@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Jermaine", "Terry", "jt@gmail.com","1/1/2020")) break;
      if(DataCreateError.OK != createOneUser("Christopher", "Wilson", "cw@gmail.com","1/1/2020")) break;

      if(DataCreateError.OK != createOneUser("Brandon", "Woolridge", "bw@gmail.com","1/1/2020")) break;
      finished = true;
    }
    if(!finished) {
      logger.log(Level.SEVERE, "Unable to Create Sample Data");
      return DataCreateError.OtherError;   
    }
    return DataCreateError.OK;
  }

  @Autowired
  public ApplicationLoader(Environment env, UserRepository userRepo) {
    this.environment = env;
    this.userRepo = userRepo;
  }
}
