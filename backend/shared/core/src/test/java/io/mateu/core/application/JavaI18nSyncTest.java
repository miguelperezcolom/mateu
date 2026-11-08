package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A REFLECTED (Java) page uses the same translation path as a YAML one: {@code ${i18n.key}} in
 * {@code @Title}/{@code @Label} is resolved against the translations catalogue for the request's
 * locale, and the built-in validation messages follow that locale. In the Explorer the Java texts
 * reached the wire raw and the validation message stayed English under {@code Accept-Language: es},
 * while the same keys on a YAML page were translated.
 */
class JavaI18nSyncTest {

  @TempDir Path dir;

  @UI("/java-i18n")
  @Title("${i18n.greeting.title}")
  public static class Greeting {

    @Label("${i18n.greeting.name}")
    @NotEmpty
    String name;

    @Button
    @Label("${i18n.greeting.greet}")
    Message greet() {
      return new Message("hi " + name);
    }
  }

  private String load(String language) {
    var root =
        SpecsDir.write(
            dir,
            Map.of(
                "translations/en.yaml",
                """
                messages:
                  greeting.title: Greeting
                  greeting.name: Your name
                  greeting.greet: Greet
                """,
                "translations/es.yaml",
                """
                messages:
                  greeting.title: Saludo
                  greeting.name: Tu nombre
                  greeting.greet: Saludar
                """));
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUis(Greeting.class)) {
            var increment =
                mateu.run(
                    RunActionRqDto.builder().route("/java-i18n").actionId("").build(),
                    Map.of("Accept-Language", language));
            return new ObjectMapper().writeValueAsString(increment);
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
        });
  }

  @Test
  void titleLabelsAndButtonsOfAJavaPageAreTranslated() {
    var es = load("es");
    assertThat(es)
        .contains("Saludo")
        .contains("Tu nombre")
        .contains("Saludar")
        .doesNotContain("${i18n.");
    assertThat(load("en")).contains("Your name").doesNotContain("${i18n.");
  }

  @Test
  void theValidationMessageFollowsTheLocale() {
    assertThat(load("en")).contains("Cannot be empty");
    assertThat(load("es")).contains("No puede estar vacío").doesNotContain("Cannot be empty");
  }
}
