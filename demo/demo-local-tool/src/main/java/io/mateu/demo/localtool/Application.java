package io.mateu.demo.localtool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * A local tool: {@code java -jar local-tool.jar [folder]} starts the service, {@link OpenBrowser}
 * opens the browser on it, and the header's Quit button ({@link Shell#quit()}) stops it.
 *
 * <p>The optional folder argument is what the tool inspects; it defaults to the directory the
 * command was run in, like a CLI.
 */
@SpringBootApplication
@EnableScheduling // only for hardening.IdleShutdown
public class Application {

  public static void main(String[] args) {
    var app = new SpringApplication(Application.class);
    // Spring Boot runs headless by default; java.awt.Desktop needs it off to open the browser
    app.setHeadless(false);
    app.run(args);
  }
}
