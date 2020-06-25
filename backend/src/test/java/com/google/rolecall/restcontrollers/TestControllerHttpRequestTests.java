package com.google.rolecall.restcontrollers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** Unit tests for the /api/test enpoint for the backend server. */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class TestControllerHttpRequestTests {
    
  @LocalServerPort
  private int port;

  @Autowired
  private TestRestTemplate restTemplate;

  private String requestForm = "/api/test%s";
    
  @Test
  public void defaultGetValueReturn_success() throws Exception {
    
    // Execute
    String response = this.restTemplate.getForObject(String.format(requestForm, ""), String.class);

    // Assert
    assert(response).equals("Hello default");
  }

  @Test
  public void paramGetValueReturn_success() throws Exception {

    // Setup
    String value = "val";
    String param = String.format("?value=%s", value);
    String expected = String.format("Hello %s", value);

    // Execute
    String response = this.restTemplate.getForObject(String.format(requestForm, param),
        String.class);
    
    // Assert
    assert(response).equals(expected);
  }

  @Test
  public void postInvokeError_failure() throws Exception {
    
    // Setup
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Object> entity = new HttpEntity<Object>(headers);

    // Execute
    ResponseEntity<String> response = this.restTemplate.exchange(String.format(requestForm,""),
        HttpMethod.POST, entity, String.class);

    // Assert
    assert(response.getStatusCode().isError());
    assert(response.getBody().contains("Internal Server Error")); // Current Default Error message
  }
}
