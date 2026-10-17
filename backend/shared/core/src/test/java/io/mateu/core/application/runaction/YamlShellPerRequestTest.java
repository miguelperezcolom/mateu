package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppShell;
import java.nio.file.Path;
import java.util.Map;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A {@code type: AppShell} definition that carries access keys or {@code ${i18n.…}} is re-derived
 * per request: the shell that reaches the wire is the one this caller may see, in their language —
 * decided on the server.
 */
class YamlShellPerRequestTest {

  @TempDir Path dir;

  private static final String SHELL =
      """
      type: AppShell
      title: ${i18n.app.title}
      layout: SPLIT
      drawerClosed: true
      menu:
        - type: RouteLink
          label: ${i18n.menu.orders}
          route: orders
        - type: RouteLink
          label: Payroll
          route: payroll
          access: {roles: [hr]}
      """;

  private static final String EN =
      "type: Translations\nlocale: en\nmessages:\n  app: {title: Back office}\n  menu: {orders: Orders}\n";

  private static final String ES =
      "messages:\n  app:\n    title: Oficina\n  menu:\n    orders: Pedidos\n    unused: null\n";

  private <T> T over(Supplier<T> body) {
    var root =
        SpecsDir.write(
            dir, Map.of("shell.yaml", SHELL, "i18n/en.yaml", EN, "translations/es.yaml", ES));
    return SpecsDir.over(root, cl -> body.get());
  }

  private static FakeHttpRequest request(String language, String... roles) {
    var rq =
        new FakeHttpRequest(RunActionRqDto.builder().route("/").build())
            .withPrincipal(TestIdentities.principalWithRoles(roles));
    return language == null ? rq : rq.withHeader("Accept-Language", language);
  }

  private static java.util.List<String> labels(AppShell shell) {
    return shell.menu().stream().map(item -> ((RouteLink) item).label()).toList();
  }

  @Test
  void theShellIsTranslatedAndTrimmedForWhoAsks() {
    over(
        () -> {
          var loader = new YamlAppLoader();
          var shared = loader.load("shell.yaml");
          assertThat(shared.layout()).isEqualTo(AppLayout.SPLIT);
          assertThat(shared.drawerClosed()).isTrue();

          var clerk =
              loader.load("shell.yaml", null, request("es-ES,es;q=0.9", "clerk"), r -> true);
          assertThat(clerk.title()).isEqualTo("Oficina");
          assertThat(labels(clerk)).containsExactly("Pedidos");

          var hr = loader.load("shell.yaml", null, request("en", "hr"), r -> true);
          assertThat(hr.title()).isEqualTo("Back office");
          assertThat(labels(hr)).containsExactly("Orders", "Payroll");

          // a RouteLink to a route the caller may not reach goes too
          var unreachable =
              loader.load("shell.yaml", null, request("en", "hr"), r -> !r.contains("orders"));
          assertThat(labels(unreachable)).containsExactly("Payroll");
          return null;
        });
  }

  @Test
  void aPersonalisedShellStillLandsOnTheMountHome() {
    over(
        () -> {
          var shell =
              new YamlAppLoader().load("shell.yaml", "dashboard", request("en", "hr"), r -> true);
          assertThat(shell.homeRoute()).isEqualTo("dashboard");
          return null;
        });
  }

  @Test
  void aBundleExportKeepsTheExpressionsForTheBrowser() {
    over(
        () -> {
          var raw = request("es");
          raw.withAttribute(TranslationRegistry.RAW_ATTRIBUTE, true);
          var shell = new YamlAppLoader().load("shell.yaml", null, raw, r -> true);
          assertThat(shell.title()).isEqualTo("${i18n.app.title}");
          return null;
        });
  }

  @Test
  void theLanguageIsTheFirstAcceptLanguageTag() {
    assertThat(TranslationRegistry.acceptLanguage(request("es-es;q=1, en;q=0.5")))
        .isEqualTo("es-ES");
    assertThat(TranslationRegistry.acceptLanguage(request("*"))).isNull();
    assertThat(TranslationRegistry.acceptLanguage(request(""))).isNull();
    assertThat(TranslationRegistry.acceptLanguage(request(null))).isNull();
    assertThat(TranslationRegistry.acceptLanguage(null)).isNull();
  }

  @Test
  void aMissingTextFallsBackToTheLanguageThenToTheConfiguredFallback() {
    var previous = System.getProperty("mateu.i18n.fallback");
    try {
      System.setProperty("mateu.i18n.fallback", "en-GB");
      over(
          () -> {
            var registry = new TranslationRegistry();
            assertThat(registry.message("menu.orders", "es-MX")).isEqualTo("Pedidos");
            assertThat(registry.message("app.title", "fr")).isEqualTo("Back office");
            assertThat(registry.message("menu.unused", "es")).as("null is no text").isNull();
            assertThat(registry.interpolate("${i18n.nope} here", "es")).isEqualTo("nope here");
            return null;
          });
    } finally {
      if (previous == null) {
        System.clearProperty("mateu.i18n.fallback");
      } else {
        System.setProperty("mateu.i18n.fallback", previous);
      }
    }
  }

  @Test
  void aTranslationsFileIsRecognisedByTypeOrDirectoryAndNeedsALocale() {
    var yaml =
        new com.fasterxml.jackson.databind.ObjectMapper(
            new com.fasterxml.jackson.dataformat.yaml.YAMLFactory());
    try {
      assertThat(
              TranslationRegistry.parse(
                  yaml.readTree("type: Translations\nmessages: {a: b}\n"), null))
          .as("no locale and no file name to take it from")
          .isNull();
      assertThat(
              TranslationRegistry.parse(
                  yaml.readTree("messages: {a: b}\n"), "specs/ui/other/es.yaml"))
          .as("untyped outside translations/")
          .isNull();
      var parsed =
          TranslationRegistry.parse(
              yaml.readTree("messages: {a: {b: c}}\n"), "specs/ui/translations/de.yml");
      assertThat(parsed.locale()).isEqualTo("de");
      assertThat(parsed.messages()).containsEntry("a.b", "c");
    } catch (Exception e) {
      throw new AssertionError(e);
    }
  }
}
