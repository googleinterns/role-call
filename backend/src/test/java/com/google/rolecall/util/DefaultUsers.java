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
        .setIsActive(true)
        .setCanLogin(true)
        .setAdmin(true)
        .setRecievesNotifications(false)
        .setManagePerformances(false)
        .setManageCasts(false)
        .setManagePieces(false)
        .setManageRoles(false)
        .setManageRules(false)
        .build();
    } catch(InvalidParameterException e) {
      throw new RuntimeException("This should never happen");
    }

    CustomUserDetail detail = CustomUserDetail.build(user);
    Principal principal = new RememberMeAuthenticationToken("", detail, detail.getAuthorities());

    return principal;
  }
}
