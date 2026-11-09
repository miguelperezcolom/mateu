package io.mateu.explorer.staticremote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Only there so the bundle goal (and `mvn spring-boot:run`, for authoring) can boot the specs. The
 * deliverable is target/mateu-bundle — static files, no server.
 */
@SpringBootApplication
public class StaticRemoteApplication {

  public static void main(String[] args) {
    SpringApplication.run(StaticRemoteApplication.class, args);
  }
}
