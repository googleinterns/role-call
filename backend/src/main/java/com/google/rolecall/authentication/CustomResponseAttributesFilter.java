package com.google.rolecall.authentication;

import java.io.IOException;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import com.google.rolecall.Constants;

import org.springframework.http.HttpHeaders;

public class CustomResponseAttributesFilter implements Filter {
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    chain.doFilter(request, response);
    addSameSiteCookieAttribute((HttpServletResponse) response);
    addAuthorizatinAttribute((HttpServletResponse) response);
  }

  private void addSameSiteCookieAttribute(HttpServletResponse response) {
    String header = response.getHeader(HttpHeaders.SET_COOKIE);
    if(header != null & !header.equals("")) {
      response.setHeader(HttpHeaders.SET_COOKIE,String.format("%s; %s", header, "SameSite=None"));
    }
  }

  private void addAuthorizatinAttribute(HttpServletResponse response) {
    response.setHeader(Constants.Headers.AUTHORIZATION, "Bearer");
  }
}
