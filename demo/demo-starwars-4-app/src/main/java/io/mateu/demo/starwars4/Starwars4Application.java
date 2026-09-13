package io.mateu.demo.starwars4;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Example 4 of the progressive Star Wars suite — page archetypes and the app shell.
 *
 * <p>Example 3 showed rich single screens. This one moves up an altitude: a {@link GalaxyDashboard}
 * built from the {@code Dashboard} archetype (a scoreboard of metric cards + chart panels) and a
 * {@link Planets} CRUD, both behind an {@code @App} shell whose menu, navigation and command-center
 * palette are inferred from the model.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Starwars4Application {

  public static void main(String[] args) {
    SpringApplication.run(Starwars4Application.class, args);
  }
}
