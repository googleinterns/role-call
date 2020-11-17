package com.google.rolecall.util;

import com.google.rolecall.models.User;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import java.security.Principal;
import org.springframework.security.authentication.RememberMeAuthenticationToken;

public class DefaultUsers {

  public static Principal getAdminPrincipal() {
    User user;
    try {
      user = User.newBuilder()
        .setFirstName("Admin")
        .setLastName("User")
        .setEmail("admin@rolecall.com")
        .setNotificationEmail("admin@rolecall.com")
        .setPictureFile("Admin_User")
        .setIsAdmin(true)
        .setIsChoreographer(true)
        .setIsDancer(true)
        .setIsOther(true)
        .setCanLogin(true)
        .setRecievesNotifications(false)
        .setManagePerformances(false)
        .setManageCasts(false)
        .setManagePieces(false)
        .setManageRoles(false)
        .setManageRules(false)
        .setIsActive(true)
        .build();
    } catch(InvalidParameterException e) {
      throw new RuntimeException("This should never happen");
    }

    CustomUserDetail detail = CustomUserDetail.build(user);
    Principal principal = new RememberMeAuthenticationToken("X", detail, detail.getAuthorities());

    return principal;
  }
}
