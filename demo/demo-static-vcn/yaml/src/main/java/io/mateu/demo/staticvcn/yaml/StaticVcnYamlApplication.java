package io.mateu.demo.staticvcn.yaml;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Only here so the same definitions can ALSO be served by a live backend ({@code mvn spring-boot:run}
 * → http://localhost:8794) for comparison. The deliverable of this module is the static site that
 * {@code mvn -Pbundle package} writes to {@code target/mateu-bundle/}, which needs no backend at all.
 */
@SpringBootApplication(scanBasePackages = "io.mateu.demo")
public class StaticVcnYamlApplication {

  public static void main(String[] args) {
    SpringApplication.run(StaticVcnYamlApplication.class, args);
  }
}
