package io.mateu.demo.starwars5.shell;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Example 5 of the progressive Star Wars suite — build-time federation.
 *
 * <p>Two independent {@code @UI} modules (characters-ui, planets-ui) are composed by this one shell
 * app at build time: one deployment, several independently-authored modules. The only glue is the
 * shell's {@code @App} menu and the Maven dependencies + annotation-processor wiring in the poms.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Starwars5Application {

  public static void main(String[] args) {
    SpringApplication.run(Starwars5Application.class, args);
  }
}
