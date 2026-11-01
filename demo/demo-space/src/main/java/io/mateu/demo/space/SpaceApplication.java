package io.mateu.demo.space;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A Mateu app with NO Java UI code: the mount ({@code space.ui.yaml}), the app shell ({@code
 * app.yaml}), every page and the REST source catalogue ({@code sources.yaml}) are authored as data
 * under {@code src/main/resources/specs/ui/}, over the space-service API. This class is the only
 * Java, and it does nothing but boot the server.
 */
@SpringBootApplication(scanBasePackages = "io.mateu.demo")
public class SpaceApplication {

  public static void main(String[] args) {
    SpringApplication.run(SpaceApplication.class, args);
  }
}
