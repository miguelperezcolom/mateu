package io.mateu.explorer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Mateu Explorer — a Spring Boot MVC service rendered with the Oracle Redwood renderer, meant to
 * host a publishable Mateu demo. Add {@code @UI}/{@code @Route} screens under {@code
 * io.mateu.explorer.ui} and they are generated as controllers at compile time.
 */
@SpringBootApplication
public class ExplorerApplication {

  public static void main(String[] args) {
    SpringApplication.run(ExplorerApplication.class, args);
  }
}
