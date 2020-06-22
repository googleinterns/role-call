package com.google.rolecall.restcontrollers;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/** Smoke Tests for all REST controller objects for existence. */
@ExtendWith(SpringExtension.class)
@SpringBootTest
public class ControllerSmokeTests {

  @Autowired
  private TestController testController;

  @Test
  public void testControllerLoad_success() throws Exception {
    assertNotNull(testController);
  }
}
