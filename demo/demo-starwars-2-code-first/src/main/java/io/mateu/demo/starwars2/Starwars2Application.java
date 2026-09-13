package io.mateu.demo.starwars2;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Example 2 of the progressive Star Wars suite — the first line of Java.
 *
 * <p>Where Example 1 ({@code demo-starwars}) declared everything as YAML over an external API, this
 * one declares the model as a Java record and lets Mateu render a full CRUD from it: an {@link
 * Characters} view extending {@code AutoCrud<Character>}, backed by an in-memory {@code CrudStore}.
 * No YAML, no external API, no database — just one annotated class and its store.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Starwars2Application {

  public static void main(String[] args) {
    SpringApplication.run(Starwars2Application.class, args);
  }
}
