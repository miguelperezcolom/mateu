package io.mateu.demo.starwars3;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Example 3 of the progressive Star Wars suite — rich forms.
 *
 * <p>Example 2 showed a CRUD inferred from one record. This one keeps declaring only information and
 * lets Mateu infer richer UX: a multi-step {@link RecruitWizard} (with a two-column zoned step) and a
 * tabbed {@link Dossier} form exercising a spread of field types (textarea, stars, toggle, date,
 * money, radios). A tiny {@code @App} shell ({@link Home3}) puts both behind a menu.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class Starwars3Application {

  public static void main(String[] args) {
    SpringApplication.run(Starwars3Application.class, args);
  }
}
