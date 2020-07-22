package com.google.rolecall;

/* Shared constants throughout the RoleCall System. */
public class Constants {

  public static class Mappings {
    public static final String USER_MANAGEMENT = "/api/user";
    public static final String SECTION_MANAGEMENT = "/api/section";
    public static final String  INCREMENT_USER_LOGIN = "/api/increment-login";
  }

  public static class RequestParameters {
    public static final String  USER_ID = "userid";
    public static final String  ROLE_ID = "roleid";
    public static final String  CAST_ID = "castid";
    public static final String  SECTION_ID = "sectionid";
  }

  // Prevents object creation
  private Constants() {
  }
}
