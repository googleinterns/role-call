package com.google.rolecall;

/* Shared constants throughout the RoleCall System. */
public class Constants {

  public static class Mappings {
    public static final String CURRENT_USER = "/api/self";
    public static final String USER_MANAGEMENT = "/api/user";
    public static final String SECTION_MANAGEMENT = "/api/section";
    public static final String CAST_MANAGEMENT = "/api/cast";
    public static final String  INCREMENT_USER_LOGIN = "/api/increment-login";
  }

  public static class RequestParameters {
    public static final String USER_ID = "userid";
    public static final String ROLE_ID = "roleid";
    public static final String CAST_ID = "castid";
    public static final String SECTION_ID = "sectionid";
  }

  public static class Headers {
    public static final String EMAIL = "Email";
    public static final String OAUTH_KEY = "Authorization";
  }

  public static class Roles {
    public static final String ADMIN = "ADMIN";
    public static final String LOGIN = "LOGIN";
    public static final String NOTIFICATIONS = "NOTIFICATIONS";
    public static final String MANAGE_PERFORMANCES = "MANAGE_PERFORMANCES";
    public static final String MANAGE_CASTS = "MANAGE_CASTS";
    public static final String MANAGE_PIECES = "MANAGE_PIECES";
    public static final String MANAGE_ROLES = "MANAGE_ROLES";
    public static final String MANAGE_RULES = "MANAGE_RULES";
    public static final String[] ROLES = new String[] {
        ADMIN, LOGIN, NOTIFICATIONS, MANAGE_PERFORMANCES, MANAGE_CASTS, MANAGE_PIECES,
        MANAGE_ROLES, MANAGE_RULES
    };
  }

  // Prevents object creation
  private Constants() {
  }
}
