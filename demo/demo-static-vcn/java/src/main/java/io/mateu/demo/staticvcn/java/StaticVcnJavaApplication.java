package io.mateu.demo.staticvcn.java;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Only here so the same screens can ALSO be served by a live backend ({@code mvn spring-boot:run}
 * → http://localhost:8795) for comparison. The deliverable of this module is the static site that
 * {@code mvn -Pbundle package} writes to {@code target/mateu-bundle/}, which needs no backend.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class StaticVcnJavaApplication {

  public static void main(String[] args) {
    SpringApplication.run(StaticVcnJavaApplication.class, args);
  }
}
