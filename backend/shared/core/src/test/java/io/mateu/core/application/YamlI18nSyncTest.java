package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.infra.DefaultTranslator;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.Translations;
import io.mateu.uidl.interfaces.TranslationsSupplier;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.LoggerFactory;

/**
 * Translations for YAML apps: {@code type: Translations} files (or {@code
 * specs/ui/translations/<locale>.yaml}) and {@code ${i18n.key}} in any authored text, resolved ON
 * THE SERVER for the request's locale — so the wire carries finished text for every renderer.
 */
class YamlI18nSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private Path fixture() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: hello
                layout: hello.yaml
            """,
            "hello.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: "${i18n.greeting.title}"
                - type: Text
                  text: "Bye: ${i18n.farewell}!"
                - type: Text
                  text: "${i18n.missing.key}"
                - type: Text
                  text: "${i18n.code.only}"
                - type: Button
                  label: "${i18n.actions.save}"
                  actionId: save
            """,
            // the convention: no `type:`, the file name is the locale
            "translations/en.yaml",
            """
            messages:
              greeting:
                title: Hello
              farewell: Goodbye
              actions:
                save: Save
            """,
            "translations/es.yaml",
            """
            type: Translations
            locale: es
            messages:
              greeting:
                title: Hola
              actions: {save: Guardar}
            """,
            // anywhere under specs/ui with an explicit type
            "i18n/french.yaml",
            """
            type: Translations
            locale: fr
            messages:
              greeting.title: Bonjour
            """));
  }

  private <T> T withMateu(List<Object> beans, Function<TestMateu, T> body) {
    var root = fixture();
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu = TestMateu.withUisAndBeans(beans)) {
            return body.apply(mateu);
          }
        });
  }

  private static String load(TestMateu mateu, String route, String acceptLanguage) {
    var rq = RunActionRqDto.builder().route(route).actionId("").build();
    var headers =
        acceptLanguage == null
            ? Map.<String, String>of()
            : Map.of("Accept-Language", acceptLanguage);
    return JSON.valueToTree(mateu.run(rq, headers)).toString();
  }

  @Test
  void textsAreResolvedForTheRequestsLocaleWithTheFallbackChain() {
    withMateu(
        List.of(),
        mateu -> {
          var es = load(mateu, "/hello", "es");
          assertThat(es).contains("\"Hola\"").contains("Guardar");
          // a key Spanish lacks falls back to the fallback locale (en)
          assertThat(es).contains("Bye: Goodbye!");
          // a key nobody has shows the key itself
          assertThat(es).contains("\"missing.key\"");
          assertThat(es).doesNotContain("${i18n.");

          assertThat(load(mateu, "/hello", "es-ES,es;q=0.9")).contains("\"Hola\"");
          assertThat(load(mateu, "/hello", "fr-FR")).contains("\"Bonjour\"");
          assertThat(load(mateu, "/hello", "de")).contains("\"Hello\"").contains("\"Save\"");
          assertThat(load(mateu, "/hello", null)).contains("\"Hello\"");
          return null;
        });
  }

  @Test
  void aMissingKeyIsWarnedAboutOncePerLocale() {
    var logger = (Logger) LoggerFactory.getLogger(TranslationRegistry.class);
    var appender = new ListAppender<ILoggingEvent>();
    appender.start();
    logger.addAppender(appender);
    try {
      withMateu(
          List.of(),
          mateu -> {
            load(mateu, "/hello", "es");
            load(mateu, "/hello", "es");
            return null;
          });
      var warnings = new ArrayList<String>();
      for (var event : appender.list) {
        if (event.getFormattedMessage().contains("missing.key")) {
          warnings.add(event.getFormattedMessage());
        }
      }
      assertThat(warnings).hasSize(1);
    } finally {
      logger.detachAppender(appender);
    }
  }

  /** The code producer: merged UNDER the authored files. */
  public static class CodeTranslations implements TranslationsSupplier {
    @Override
    public List<Translations> translations() {
      return List.of(
          new Translations(
              "es",
              Map.of(
                  "greeting", Map.of("title", "Hola desde código"),
                  "code", Map.of("only", "Solo en código"))));
    }
  }

  @Test
  void aCodeSupplierContributesAndTheAuthoredFilesWin() {
    withMateu(
        List.of(new CodeTranslations()),
        mateu -> {
          var es = load(mateu, "/hello", "es");
          assertThat(es).contains("Solo en código");
          assertThat(es).contains("\"Hola\"").doesNotContain("Hola desde código");
          return null;
        });
  }

  @Test
  void aBundleExportKeepsTheExpressionsForTheBrowserToResolve() {
    withMateu(
        List.of(),
        mateu -> {
          var rq = RunActionRqDto.builder().route("/hello").actionId("").build();
          var httpRequest =
              new FakeHttpRequest(rq)
                  .withAttribute("baseUrl", "")
                  .withAttribute(TranslationRegistry.RAW_ATTRIBUTE, true)
                  .withHeader("Accept-Language", "es");
          try {
            var increment = mateu.service().runAction("", rq, "", httpRequest).blockFirst();
            assertThat(JSON.valueToTree(increment).toString()).contains("${i18n.greeting.title}");
          } catch (Throwable t) {
            throw new AssertionError(t);
          }
          return null;
        });
  }

  @Test
  void theDefaultTranslatorResolvesExpressionsAndWholeKeysForJavaLabels() {
    SpecsDir.over(
        fixture(),
        cl -> {
          var translator = new DefaultTranslator(new TranslationRegistry());
          var rq =
              new FakeHttpRequest(RunActionRqDto.builder().build())
                  .withHeader("Accept-Language", "es");
          assertThat(translator.translate("${i18n.greeting.title}", rq)).isEqualTo("Hola");
          assertThat(translator.translate("greeting.title", rq)).isEqualTo("Hola");
          assertThat(translator.translate("Plain label", rq)).isEqualTo("Plain label");
          return null;
        });
  }

  @Test
  void theCatalogueIsFlattenedPerLocale() {
    SpecsDir.over(
        fixture(),
        cl -> {
          var catalogue = new TranslationRegistry().catalogue();
          assertThat(catalogue).containsKeys("en", "es", "fr");
          assertThat(catalogue.get("en")).containsEntry("actions.save", "Save");
          assertThat(catalogue.get("fr")).containsEntry("greeting.title", "Bonjour");
          return null;
        });
  }
}
