package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.AppContextSelectorDto;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppHeaderActionDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppContextSelector;
import io.mateu.uidl.data.AppGlobalSearchSource;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.AppNotificationsSource;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The shell extras a code-authored app shell declares reach the wire like the annotation ones: its
 * header actions (with a route, made absolute) ALONGSIDE the ones its class supplies, its context
 * selectors (labelled after the field when the label is blank; nameless ones dropped), a
 * notifications / global-search source enabling the bell and the search, its accent colour, and a
 * chromeless shell implying the command center.
 */
class CodeShellExtrasSyncTest {

  @UI("/code-shell")
  public static class CodeShell implements AppSupplier, AppActionsSupplier {
    @Override
    public AppShell getApp(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("Code shell")
          .homeRoute("/code-shell/home")
          .menu(List.of(new RouteLink("/code-shell/home", "Home")))
          .headerAction(new AppHeaderAction("openReports", "Reports", null, null, "reports"))
          .headerAction(new AppHeaderAction("plain", "Plain", null, null, " "))
          .contextSelectors(
              Arrays.asList(
                  new AppContextSelector(
                      "activeHotel", " ", List.of(new Option("h1", "Palace")), null),
                  new AppContextSelector(" ", "Nameless", List.of(), null),
                  null))
          .notifications(
              new AppNotificationsSource(RestDataSource.builder().url("/api/inbox").build(), null))
          .globalSearch(
              new AppGlobalSearchSource(RestDataSource.builder().url("/api/search").build()))
          .accentColor(" #0a7 ")
          .chromeless(true)
          .build();
    }

    @Override
    public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
      return List.of(new AppHeaderAction("refresh", "Refresh"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CodeShell.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static AppDto app() {
    var app = WireWalk.first(mateu.sync("/code-shell"), AppDto.class);
    assertThat(app).isNotNull();
    return app;
  }

  @Test
  void declaredHeaderActionsComeFirstThenTheSuppliedOnes() {
    var actions = app().contextActions();
    assertThat(actions)
        .extracting(AppHeaderActionDto::actionId)
        .containsExactly("openReports", "plain", "refresh");
    assertThat(actions.get(0).route()).isNotBlank().endsWith("reports");
    assertThat(actions.get(1).route()).isNull();
  }

  @Test
  void contextSelectorsAreLabelledAfterTheirFieldAndNamelessOnesDropped() {
    var selectors = app().contextSelectors();
    assertThat(selectors)
        .extracting(AppContextSelectorDto::fieldName)
        .containsExactly("activeHotel");
    assertThat(selectors.get(0).label()).isEqualTo("Active hotel");
    assertThat(selectors.get(0).options()).hasSize(1);
  }

  @Test
  void sourcesAccentAndChromelessReachTheWire() {
    var app = app();
    assertThat(app.notificationsEnabled()).isTrue();
    assertThat(app.globalSearchEnabled()).isTrue();
    assertThat(app.accentColor()).isEqualTo("#0a7");
    assertThat(app.chromeless()).isTrue();
    assertThat(app.commandCenterEnabled()).isTrue();
  }
}
