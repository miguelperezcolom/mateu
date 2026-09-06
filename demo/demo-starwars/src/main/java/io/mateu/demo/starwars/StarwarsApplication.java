package io.mateu.demo.starwars;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A Mateu app with NO Java {@code @UI} class and NO business code at all: the whole thing — the mount
 * ({@code starwars.ui.yaml}), the app shell ({@code app.yaml}), every page ({@code people.yaml},
 * {@code planets.yaml}, {@code films.yaml}) and the REST source catalogue ({@code sources.yaml}) —
 * is authored as data under {@code src/main/resources/specs/ui/}. The pages read live data from the
 * public Star Wars API; this class is the only Java, and it does nothing but boot the server.
 *
 * <p>Example 1 of the progressive example suite: it validates that a Mateu app truly works without a
 * single Java UI class, backed by an existing external API.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class StarwarsApplication {

  public static void main(String[] args) {
    SpringApplication.run(StarwarsApplication.class, args);
  }
}
