package com.google.rolecall;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/** Unit tests for core server functions and classes. */
@ExtendWith(SpringExtension.class)
@SpringBootTest
class RoleCallApplicationTests {

  @Test
  void contextLoads_success() {
    RoleCallApplication.main(new String[]{
      "--spring.main.web-environment=false"
      // TODO: Implement spring.autoconfigure.exclude to exclude the database from this test in the future
    });
  }
}
