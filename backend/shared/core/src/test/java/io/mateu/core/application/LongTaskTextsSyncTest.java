package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * A {@link LongTask}'s progress dialog opens with a framework text: English ("Starting..."), and
 * translated per request by the app's {@link Translator} like the rest of the framework's texts. It
 * used to be a hard-coded Spanish "Iniciando...".
 */
class LongTaskTextsSyncTest {

  @UI("/long-task-texts")
  public static class Importer {
    @Button
    public Flux<?> importAll() {
      return LongTask.create("Importing")
          .run(progress -> Flux.range(1, 1).map(i -> progress.step("Row " + i)));
    }
  }

  /** A translator that knows only the opening text (an app's translation of it). */
  static class SpanishTranslator implements Translator {
    @Override
    public String translate(String text, HttpRequest httpRequest) {
      return LongTask.STARTING_TEXT.equals(text) ? "Empezando..." : text;
    }
  }

  private static String openingOf(TestMateu mateu) {
    var increments =
        mateu.runAll(
            RunActionRqDto.builder()
                .route("/long-task-texts")
                .actionId("importAll")
                .serverSideType(Importer.class.getName())
                .build());
    return JsonSerializer.toJson(increments.get(0));
  }

  @Test
  void theDialogOpensWithAnEnglishFrameworkText() {
    try (var mateu = TestMateu.withUis(Importer.class)) {
      assertThat(openingOf(mateu)).contains("Starting...").doesNotContain("Iniciando");
    }
  }

  @Test
  void theOpeningTextIsTranslatedByTheAppsTranslator() {
    try (var mateu = TestMateu.withUisAndBeans(List.of(new SpanishTranslator()), Importer.class)) {
      assertThat(openingOf(mateu)).contains("Empezando...").doesNotContain("Starting...");
    }
  }
}
