package com.google.rolecall.restcontrollers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Static mappings enpoint
 */
@RestController
@RequestMapping("/api/")
public class TestController {
  
	@RequestMapping("/test")
	public String sayHello(@RequestParam(value="value", required=false, defaultValue="default") String value) {
	  return "Hello " + value;
	}
}
