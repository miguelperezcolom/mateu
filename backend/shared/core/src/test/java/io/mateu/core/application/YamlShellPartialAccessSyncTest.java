package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * A {@code type: Partial} inside a {@code type: AppShell} (a menu entry, a header widget) is the
 * shell's own source like a page's: its access keys are applied per caller. The shell loader never
 * inlined partials, so a guarded menu entry or widget living in a partial reached every caller.
 */
class YamlShellPartialAccessSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private Path fixture() {
    return SpecsDir.write(
        dir,
        Map.of(
            "app.ui.yaml",
            """
            type: UI
            basePath: /
            routes:
              - routes.yaml
            """,
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: ""
                definition: shell.yaml
              - route: home
                definition: home.yaml
            """,
            "shell.yaml",
            """
            type: AppShell
            title: Staff
            variant: MENU_ON_TOP
            homeRoute: home
            menu:
              - type: RouteLink
                label: Home
                route: home
              - type: Partial
                ref: hr-menu
            widgets:
              - type: Partial
                ref: hr-widget
              - type: Partial
                ref: greeting
            """,
            "home.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: "Home"
            """,
            "partials/hr-menu.yaml",
            """
            content:
              - type: RouteLink
                label: Payroll menu
                route: home
                eyesOnly: {roles: [hr]}
            """,
            "partials/greeting.yaml",
            """
            type: Text
            text: "${i18n.greeting}"
            """,
            "translations/en.yaml",
            """
            messages:
              greeting: Hello there
            """,
            "partials/hr-widget.yaml",
            """
            type: Text
            text: "Payroll widget"
            eyesOnly: {roles: [hr]}
            """));
  }

  private String load(Map<String, String> headers) {
    return SpecsDir.over(
        fixture(),
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            var rq =
                RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build();
            return JSON.valueToTree(mateu.run(rq, headers)).toString();
          }
        });
  }

  @Test
  void aGuardedMenuEntryAndWidgetInAShellPartialAreRemovedForACallerWhoMayNotSeeThem() {
    var anonymous = load(Map.of());
    assertThat(anonymous)
        .contains("Home")
        .doesNotContain("Payroll menu")
        .doesNotContain("Payroll widget");
  }

  @Test
  void aShellPartialsTextsAreTranslated() {
    assertThat(load(Map.of("Accept-Language", "en")))
        .contains("Hello there")
        .doesNotContain("i18n.greeting");
  }

  @Test
  void theyReachACallerWhoMay() {
    var hr = load(TestIdentities.headersWithRoles("hr"));
    assertThat(hr).contains("Payroll menu").contains("Payroll widget");
  }
}
