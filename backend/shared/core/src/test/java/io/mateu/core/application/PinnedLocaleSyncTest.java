package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.ConfiguredLocale;
import io.mateu.core.infra.declarative.BuiltInTexts;
import io.mateu.core.testutil.FakeHttpRequest;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * {@code mateu.locale} pins the UI language: with it set, every request gets that language — {@code
 * AppDto.locale}, Mateu's own texts, the served {@code <html lang>} — whatever the browser's {@code
 * Accept-Language}. An app's own {@link Translator#locale} still wins; an invalid value is ignored.
 */
class PinnedLocaleSyncTest {

  @SuppressWarnings("unused")
  @UI("/pinned-locale-app")
  @Title("Pinned")
  @App
  public static class PinnedApp {
    @Menu String home = "/";
  }

  @AfterEach
  void unset() {
    System.clearProperty(ConfiguredLocale.PROPERTY);
  }

  private static AppDto app(TestMateu mateu, Map<String, String> headers) {
    var increment =
        mateu.run(
            RunActionRqDto.builder().route("/pinned-locale-app").actionId("").build(), headers);
    return FullSyncPipelineTest.findMetadata(
        increment.fragments().get(0).component(), AppDto.class);
  }

  private static HttpRequest german() {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/").build())
        .withHeader("Accept-Language", "de-DE,de;q=0.9");
  }

  @Test
  void theSettingWinsOverTheBrowsersLanguage() {
    System.setProperty(ConfiguredLocale.PROPERTY, "es");
    try (var mateu = TestMateu.withUis(PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de-DE,de;q=0.9")).locale()).isEqualTo("es");
      assertThat(app(mateu, Map.of()).locale()).isEqualTo("es");
      assertThat(BuiltInTexts.translate("Save", german())).isEqualTo("Guardar");
    }
  }

  @Test
  void aRegionalTagIsNormalised() {
    System.setProperty(ConfiguredLocale.PROPERTY, "pt_br");
    try (var mateu = TestMateu.withUis(PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de")).locale()).isEqualTo("pt-BR");
      assertThat(BuiltInTexts.translate("Save", german())).isEqualTo("Salvar");
    }
  }

  @Test
  void withoutTheSettingTheBrowserDecides() {
    try (var mateu = TestMateu.withUis(PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de-DE")).locale()).isEqualTo("de-DE");
      assertThat(BuiltInTexts.translate("Save", german())).isEqualTo("Speichern");
    }
  }

  @Test
  void anInvalidValueIsIgnored() {
    System.setProperty(ConfiguredLocale.PROPERTY, "123!");
    assertThat(ConfiguredLocale.tag()).isNull();
    try (var mateu = TestMateu.withUis(PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de-DE")).locale()).isEqualTo("de-DE");
    }
  }

  @Test
  void anAppsOwnTranslatorStillDecides() {
    System.setProperty(ConfiguredLocale.PROPERTY, "es");
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
    try (var mateu = TestMateu.withUisAndBeans(List.of(byUserPreference), PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de")).locale()).isEqualTo("ca");
    }
  }

  @Test
  void aTranslatorThatDoesNotNameALanguageLeavesItToTheSetting() {
    System.setProperty(ConfiguredLocale.PROPERTY, "fr");
    Translator onlyTexts = (text, httpRequest) -> text;
    try (var mateu = TestMateu.withUisAndBeans(List.of(onlyTexts), PinnedApp.class)) {
      assertThat(app(mateu, Map.of("Accept-Language", "de")).locale()).isEqualTo("fr");
      assertThat(BuiltInTexts.translate("Save", german())).isEqualTo("Enregistrer");
    }
  }

  @Test
  void theServedPageCarriesThePinnedLanguage() {
    var page = "<!doctype html><html lang=\"en\"><head></head></html>";
    assertThat(ConfiguredLocale.htmlLang(page)).isEqualTo(page);
    System.setProperty(ConfiguredLocale.PROPERTY, "pt-BR");
    assertThat(ConfiguredLocale.htmlLang(page)).contains("<html lang=\"pt-BR\">");
  }
}
