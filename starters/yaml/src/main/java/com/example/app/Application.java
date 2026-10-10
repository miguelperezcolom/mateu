package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Only boots the server. The whole UI — mount, app shell, routes, pages and REST sources — is data
 * under {@code src/main/resources/specs/ui/}; there is no UI code to write.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Application {

  public static void main(String[] args) {
    // Until your API exists, REST sources answer with the `sample:` data of specs/ui/sources.yaml.
    // Run with -Dmateu.sources.mock=false (or MATEU_SOURCES_MOCK=false) to call the real endpoints,
    // or delete this line.
    if (System.getProperty("mateu.sources.mock") == null && System.getenv("MATEU_SOURCES_MOCK") == null) {
      System.setProperty("mateu.sources.mock", "true");
    }
    SpringApplication.run(Application.class, args);
  }
}
