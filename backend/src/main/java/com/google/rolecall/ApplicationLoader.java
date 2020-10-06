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
          .setMiddleName("")
          .setLastName(adminLastName)
          .setSuffix("")
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
    if(DataCreateError.OK != createTestData()) {
      logger.log(Level.SEVERE, "Unable to Create Sample Data");
    }
  }

  // TODO: Remove the sameple data creation once the customer is up and running.

  // Create sample data
  
  private enum DataCreateError {
    OK,
    OtherError
  }

  private void createOneUser(String fName, String mName, String lName, String suffix,
      String email, String dateJoined, boolean isAdmin) throws ParseException, InvalidParameterException {
    Calendar cal = Calendar.getInstance();
    SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy", Locale.US);
    User user;

      cal.setTime(sdf.parse(dateJoined));

      user = User.newBuilder()
          .setFirstName(fName)
          .setMiddleName(mName)
          .setLastName(lName)
          .setSuffix(suffix)
          .setEmail(email)
          .setDateJoined(cal)
          .setIsAdmin(isAdmin)
          .setIsActive(true)
          .setCanLogin(true)
          .setIsDancer(!isAdmin)
          .build();
      userRepo.save(user);
  }

  private DataCreateError createTestData() {
    logger.log(Level.WARNING, "Creating test data.");    
    try {
      createOneUser("Robert", "", "Battle", "", "rb@gmail.com","1/1/2020", true);
      createOneUser("Clifton", "", "Brown", "", "cliffsedge98@gmail.com","1/1/2020", true);
      createOneUser("Ronni", "", "Favors", "", "rdfavors@gmail.com","1/1/2020", true);
      createOneUser("Matthew", "", "Rushing", "", " matthewtonyrushing@gmail.com","1/1/2020", true);
      createOneUser("Kristin", "Colvin", "Young", "", "1975travelbug@gmail.com","1/1/2020", true);

      createOneUser("Jeroboam", "", "Bozeman", "", "bb@gmail.com","1/1/2020", false);
      createOneUser("Clifton", "", "Brown", "", "cb@gmail.com","1/1/2020", false);
      createOneUser("Khalia", "", "Campbell", "", "kc@gmail.com","1/1/2020", false);
      createOneUser("Patrick", "", "Coker", "", "pc@gmail.com","1/1/2020", false);
      // Daley-Perdomo
      createOneUser("Sarah", "", "Daley", "", "sd@gmail.com","1/1/2020", false);
      // DeVore-Stokes
      createOneUser("Ghrai", "", "DeVore", "", "gde@gmail.com","1/1/2020", false);
      createOneUser("Solomon", "", "Dumas", "", "sdu@gmail.com","1/1/2020", false);
      createOneUser("Samantha", "", "Figgins", "", "sf@gmail.com","1/1/2020", false);
      createOneUser("James", "", "Gilmer", "", "jg@gmail.com","1/1/2020", false);
      createOneUser("Vernard", "J.", "Gilmore", "", "vg@gmail.com","1/1/2020", false);
      createOneUser("Jacqueline", "", "Green", "", "jgr@gmail.com","1/1/2020", false);
      createOneUser("Jacquelin", "", "Harris", "", "jh@gmail.com","1/1/2020", false);
      createOneUser("Michael", "", "Jackson", " Jr.", "mj@gmail.com","1/1/2020", false);
      createOneUser("Yazzmeen", "", "Laidler", "", "yl@gmail.com","1/1/2020", false);
      createOneUser("Yannick", "", "Lebrun", "", "yle@gmail.com","1/1/2020", false);
      createOneUser("Constance", "Stamatiou", "Lopez", "", "csl@gmail.com","1/1/2020", false);
      createOneUser("Renaldo", "", "Maurice", "", "rm@gmail.com","1/1/2020", false);
      createOneUser("Corrin", "Rachelle", "Mitchell", "", "crm@gmail.com","1/1/2020", false);
      createOneUser("Chalvar", "", "Monteiro", "", "cm@gmail.com","1/1/2020", false);
      // BelÃ©n | Pereyra-Alem
      createOneUser("Belen", "Indhira", "Pereyra", "", "bp@gmail.com","1/1/2020", false);
      createOneUser("Jessica", "Amber", "Pinkett", "", "jap@gmail.com","1/1/2020", false);
      createOneUser("Miranda", "", "Quinn", "", "mq@gmail.com","1/1/2020", false);
      createOneUser("Jamar", "", "Roberts", "", "jr@gmail.com","1/1/2020", false);
      createOneUser("Kanji", "", "Segawa", "", "ks@gmail.com","1/1/2020", false);
      createOneUser("Courtney", "Celeste", "Spears", "", "ccs@gmail.com","1/1/2020", false);
      createOneUser("Jermaine", "", "Terry", "", "jt@gmail.com","1/1/2020", false);
      createOneUser("Christopher", "R.", "Wilson", "", "cw@gmail.com","1/1/2020", false);
      createOneUser("Brandon", "", "Woolridge", "", "bw@gmail.com","1/1/2020", false);
    } catch(InvalidParameterException e) {
      return DataCreateError.OtherError;
    } catch(ParseException e) {
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
