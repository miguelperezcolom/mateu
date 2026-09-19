package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @App(route = "/x")} declares BOTH that a class is an app AND its base path (coherence-plan
 * #5) — the single annotation a newcomer reaches for, equivalent to {@code @UI("/x") @App}. The
 * older {@code @UI("/x") @App} spelling keeps working; when both carry a route, {@code @App(route)}
 * wins.
 */
class AppRouteSyncTest {

  @App(route = "/app-route")
  @Title("App via @App route")
  public static class AppViaAppRoute {
    @Menu String screen = "/app-route/screen";
  }

  @UI("/app-route/screen")
  @Title("Screen")
  public static class AppRouteScreen {
    String note = "screen content";
  }

  // Both a @UI route and an @App(route): the @App one wins.
  @UI("/legacy-ui-route")
  @App(route = "/app-wins")
  @Title("Two paths")
  public static class TwoPaths {
    @Menu String screen = "/app-route/screen";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AppViaAppRoute.class, AppRouteScreen.class, TwoPaths.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static AppDto appOf(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  @Test
  void anAppDeclaredWithAppRouteResolvesAndRendersAsAnApp() {
    var app = appOf("/app-route");
    assertThat(app).isNotNull();
    assertThat(app.serverSideType()).isEqualTo(AppViaAppRoute.class.getName());
    assertThat(app.title()).isEqualTo("App via @App route");
  }

  @Test
  void appRouteWinsWhenBothAppRouteAndUiArePresent() {
    // when a class carries both @UI("/legacy-ui-route") and @App(route = "/app-wins"), the @App
    // route is the canonical one: the class resolves there.
    var app = appOf("/app-wins");
    assertThat(app).isNotNull();
    assertThat(app.serverSideType()).isEqualTo(TwoPaths.class.getName());
  }
}
