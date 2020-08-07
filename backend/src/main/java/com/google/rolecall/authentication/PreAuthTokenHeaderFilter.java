package com.google.rolecall.authentication;

import com.google.rolecall.Constants;
import javax.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;

/** Parses the header of a request for EMAIL and AUTHORIZZATION used in authentication */
public class PreAuthTokenHeaderFilter extends AbstractPreAuthenticatedProcessingFilter {

  @Override
  protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
    return request.getHeader(Constants.Headers.EMAIL);
  }

  @Override
  protected Object getPreAuthenticatedCredentials(HttpServletRequest request) {
    String fullValue = request.getHeader(Constants.Headers.OAUTH_KEY);
    String prefix = "Bearer ";

    if(fullValue != null && fullValue.startsWith(prefix)) {
      return fullValue.substring(prefix.length());
    }

    return "";
  }
}
