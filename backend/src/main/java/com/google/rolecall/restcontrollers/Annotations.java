package com.google.rolecall.restcontrollers;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.core.annotation.AliasFor;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/* General annotations for REST Controllers and asyncronous API endpoint calls. */
final class Annotations {

  /* GET request methods of an @Endpoint class. */
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  @Async
  @RequestMapping(method = RequestMethod.GET)
  @interface Get {
    @AliasFor(annotation = RequestMapping.class, attribute = "params")
    String[] value() default {};
  }

  /* POST request methods of an @Endpoint class. */
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  @Async
  @RequestMapping(method = RequestMethod.POST)
  @interface Post {
    @AliasFor(annotation = RequestMapping.class, attribute = "params")
    String[] value() default {};
  }

  /* Patch request methods of an @Endpoint class. */
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  @Async
  @RequestMapping(method = RequestMethod.PATCH)
  @interface Patch {
    @AliasFor(annotation = RequestMapping.class, attribute = "params")
    String[] value() default {};
  }

  /* Delete request methods of an @Endpoint class. */
  @Target(ElementType.METHOD)
  @Retention(RetentionPolicy.RUNTIME)
  @Async
  @RequestMapping(method = RequestMethod.DELETE)
  @interface Delete {
    @AliasFor(annotation = RequestMapping.class, attribute = "params")
    String[] value() default {};
  }

  /* Describes a generic REST enpoint class for mapping to any request types. */
  @Target(ElementType.TYPE)
  @Retention(RetentionPolicy.RUNTIME)
  @RestController
  @RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @interface Endpoint {
    @AliasFor(annotation = RequestMapping.class, attribute = "path")
    String value();
  }
}
