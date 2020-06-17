package com.google.rolecall.restcontrollers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;

/**
 * Tests for the /api/test enpoint via http requests to the Spring Application server.
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class TestControllerHttpRequestTests {
    
	@LocalServerPort
	private int port;

	@Autowired
	private TestRestTemplate restTemplate;
    
    @Test
	public void apiDefaultValueReturn() throws Exception {
		assert(this.restTemplate.getForObject("http://localhost:" + port + "/api/test",
				String.class)).equals("Hello default");
	}

    @Test
	public void apiParamValueReturn() throws Exception {
        String value = "val";
		assert(this.restTemplate.getForObject("http://localhost:" + port + "/api/test?value="+value,
				String.class)).equals("Hello " + value);
	}
}
