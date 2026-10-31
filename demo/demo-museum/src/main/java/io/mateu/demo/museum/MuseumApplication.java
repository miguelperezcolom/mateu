package io.mateu.demo.museum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A Mateu app with NO Java UI code: the mount, the app shell, every page and the REST source
 * catalogue are authored as data under {@code src/main/resources/specs/ui/}, over museum-service.
 * This class only boots the server.
 */
@SpringBootApplication(scanBasePackages = "io.mateu.demo")
public class MuseumApplication {

  public static void main(String[] args) {
    SpringApplication.run(MuseumApplication.class, args);
  }
}
