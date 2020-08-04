package com.google.rolecall.authentication;

import com.google.rolecall.Constants;
import javax.servlet.http.HttpServletRequest;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;

public class PreAuthTokenHeaderFilter extends AbstractPreAuthenticatedProcessingFilter {

  @Override
  protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
    return request.getHeader(Constants.Headers.EMAIL);
  }

  @Override
  protected Object getPreAuthenticatedCredentials(HttpServletRequest request) {
    return request.getHeader(Constants.Headers.OAUTH_KEY);
  }
}
