package com.google.rolecall;

/* Shared constants throughout the RoleCall System. */
public class Constants {

  public static class Mappings {
    public static final String
    USER_MANAGEMENT = "/api/user",
    INCREMENT_USER_LOGIN = "/api/increment-login";
  }

  public static class RequestParameters {
    public static final String
    USER_ID = "userid",
    ROLE_ID = "roleid",
    CAST_ID = "castid",
    SECTION_ID = "sectionid";
  }

  // Prevents object creation
  private Constants() {}
}
