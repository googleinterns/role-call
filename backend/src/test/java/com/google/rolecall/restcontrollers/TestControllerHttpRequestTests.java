package com.google.rolecall.restcontrollers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;

/** Unit tests for the /api/test enpoint for the backend server. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class TestControllerHttpRequestTests {
    
  @LocalServerPort
  private int port;

  @Autowired
  private TestRestTemplate restTemplate;

  private String requestForm = "http://localhost:%d/api/test%s";
    
  @Test
  public void defaultValueReturn_success() throws Exception {
    assert(this.restTemplate.getForObject(String.format(requestForm, port, ""),
        String.class)).equals("Hello default");
  }

  @Test
  public void paramValueReturn_success() throws Exception {

    // Setup
    String value = "val";
    String param = String.format("?value=%s", value);
    String expect = String.format("Hello %s", value);
    
    // Assert
    assert(this.restTemplate.getForObject(String.format(requestForm,port,param),
        String.class)).equals(expect);
  }
}
