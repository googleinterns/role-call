package com.google.rolecall;

/* Shared constants throughout the RoleCall System. */
public class Constants {

  public static class Mappings {
    public static final String CURRENT_USER = "/api/self";
    public static final String USER_MANAGEMENT = "/api/user";
    public static final String SECTION_MANAGEMENT = "/api/section";
    public static final String CAST_MANAGEMENT = "/api/cast";
    public static final String PERFORMANCE_MANAGEMENT = "/api/performance";
    public static final String DASHBOARD_MANAGEMENT = "/api/dashboard";
    public static final String UNAVAILABILITY_MANAGEMENT = "/api/unavailable";
  }

  public static class RequestParameters {
    public static final String USER_ID = "userid";
    public static final String ROLE_ID = "roleid";
    public static final String CAST_ID = "castid";
    public static final String SECTION_ID = "sectionid";
    public static final String PERFORMANCE_ID = "performanceid";
    public static final String UNAVAILABLE_ID = "unavailableid";
    public static final String START_DATE = "startdate";
    public static final String END_DATE = "enddate";
  }

  public static class Headers {
    public static final String EMAIL = "Email";
    public static final String AUTHORIZATION = "Authorization";
    public static final String WWW_AUTHENTICATE = "www-authenticate";
  }

  public static class Roles {
    public static final String ADMIN = "ADMIN";
    public static final String CHOREOGRAPHER = "CHOREOGRAPHER";
    public static final String DANCER = "DANCER";
    public static final String OTHER = "OTHER";
    public static final String[] ROLES = new String[] {
        ADMIN, CHOREOGRAPHER, DANCER, OTHER,
    };
  }

  public static class Permissions {
    public static final String LOGIN = "LOGIN";
    public static final String NOTIFICATIONS = "NOTIFICATIONS";
    public static final String MANAGE_PERFORMANCES = "MANAGE_PERFORMANCES";
    public static final String MANAGE_CASTS = "MANAGE_CASTS";
    public static final String MANAGE_BALLETS = "MANAGE_BALLETS";
    public static final String MANAGE_ROLES = "MANAGE_ROLES";
    public static final String MANAGE_RULES = "MANAGE_RULES";
    public static final String[] PERMISSIONS = new String[] {
        LOGIN, NOTIFICATIONS, MANAGE_PERFORMANCES, MANAGE_CASTS, MANAGE_BALLETS,
        MANAGE_ROLES, MANAGE_RULES,
    };
  }


  public static class UnavailabilityReasons {
    public static final String UNDEF = "UNDEF";
    public static final String INJURY = "INJURY";
    public static final String VACATION = "VACATION";
    public static final String OTHER = "OTHER";

  }


  public static class Notifications {
    public static final String PROJECT_ID = "absolute-water-286821";
    public static final String TOPIC_ID = "rolecall";
  }

  // Prevents object creation
  // private
  // the above (private) was commented out because it breaks our unit tests
  Constants() {
  }
}
