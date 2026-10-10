package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Translator;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The UI language travels on the app shell ({@code AppDto.locale}): the web client sets it on
 * {@code <html lang>} and draws its own chrome in it. It is what the app's {@link Translator} says
 * — by default the request's {@code Accept-Language}, nothing when the browser sends none.
 */
class AppLocaleSyncTest {

  @SuppressWarnings("unused")
  @UI("/locale-app")
  @Title("Locale")
  @App
  public static class LocaleApp {
    @Menu String home = "/";
  }

  private static AppDto app(TestMateu mateu, Map<String, String> headers) {
    var increment =
        mateu.run(RunActionRqDto.builder().route("/locale-app").actionId("").build(), headers);
    return FullSyncPipelineTest.findMetadata(
        increment.fragments().get(0).component(), AppDto.class);
  }

  @Test
  void theDefaultTranslatorAnswersTheRequestsAcceptLanguage() {
    try (var mateu = TestMateu.withUis(LocaleApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "es-ES,es;q=0.9,en;q=0.8")).locale())
          .isEqualTo("es-ES");
      assertThat(app(mateu, Map.of()).locale()).isNull();
    }
  }

  @Test
  void aCustomTranslatorDecidesTheLanguage() {
    Translator byUserPreference =
        new Translator() {
          @Override
          public String translate(String text, HttpRequest httpRequest) {
            return text;
          }

          @Override
          public String locale(HttpRequest httpRequest) {
            return "ca";
          }
        };
    try (var mateu = TestMateu.withUisAndBeans(List.of(byUserPreference), LocaleApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "en-US")).locale()).isEqualTo("ca");
    }
  }
}
