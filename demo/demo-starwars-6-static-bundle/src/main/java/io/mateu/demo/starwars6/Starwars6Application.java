package io.mateu.demo.starwars6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Example 6 of the progressive Star Wars suite — a static bundle.
 *
 * <p>The whole ladder ends here: the declared screen compiles into a static SPA (index.html +
 * manifest.json + assets) that any CDN serves with NO Mateu backend, and the browser fetches live
 * data from the external Star Wars API. This Spring Boot main exists only so the app can also be run
 * normally (and exposes the same manifest at {@code GET /mateu/v3/bundle}); the static bundle needs
 * no server at all.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Starwars6Application {

  public static void main(String[] args) {
    SpringApplication.run(Starwars6Application.class, args);
  }
}
