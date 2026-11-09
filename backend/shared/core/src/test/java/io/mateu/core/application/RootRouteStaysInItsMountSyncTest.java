package io.mateu.core.application;

import static io.mateu.core.application.NonRootAppMenuSyncTest.appOf;
import static io.mateu.core.application.NonRootAppMenuSyncTest.screenOf;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.NonRootAppMenuSyncTest.Mount;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * A route authored for the ROOT mount ({@code home}, from a code {@link RouteEntrySupplier}) must
 * not answer a request sent to ANOTHER mount: an {@code @UI("/apps/header-actions")} app with a
 * {@code @Menu ... home} entry asked its own controller for {@code /home} and got the root app's
 * home page, because the absolute route table was consulted with the bare route before the mount.
 * Routes are relative to their mount; resolution stays inside the mount that was asked.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class RootRouteStaysInItsMountSyncTest {

  @Title("Root home")
  public static class RootHome {
    String value = "root";
  }

  @Title("Welcome")
  public static class Welcome {
    String value = "welcome";
  }

  @UI("/apps/header-actions")
  @Title("Header actions")
  public static class HeaderActionsApp {
    @Menu Welcome home;
  }

  /** The root shell, like the Explorer's: a code menu whose home is the supplied {@code home}. */
  @UI("")
  @Title("Root shell")
  public static class RootShell
      implements io.mateu.uidl.interfaces.MenuSupplier, io.mateu.uidl.interfaces.HomeRouteSupplier {
    @Override
    public String homeRoute() {
      return "home";
    }

    @Override
    public List<io.mateu.uidl.interfaces.Actionable> menu(
        io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      return List.of(new io.mateu.uidl.data.RouteLink("home", "Home"));
    }
  }

  public static class RootRoutes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(RouteEntry.of("home", RootHome.class.getName()));
    }
  }

  TestMateu mateu;
  Mount mount;

  @BeforeAll
  void boot() {
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new RootRoutes()), RootShell.class, HeaderActionsApp.class);
    mount = new Mount(mateu, HeaderActionsApp.class, "/apps/header-actions");
  }

  @AfterAll
  void shutdown() {
    mateu.close();
  }

  @Test
  void theAppsOwnHomeEntryAnswersNotTheRootMountsHomeRoute() {
    var app = appOf(mount.shell("/home")).orElseThrow();
    assertThat(screenOf(mount.content(app.homeRoute(), app.homeConsumedRoute())))
        .isEqualTo(Welcome.class.getName());
  }

  @Test
  void aBareContentLoadSentToTheMountStaysInTheMount() {
    assertThat(
            screenOf(
                mount.run(
                    io.mateu.dtos.RunActionRqDto.builder()
                        .route("/home")
                        .consumedRoute("")
                        .actionId("")
                        .initiatorComponentId("ux_root")
                        .build())))
        .isNotEqualTo(RootHome.class.getName());
  }

  @Test
  void theRootMountStillServesItsOwnRoute() {
    var root = new Mount(mateu, RootShell.class, "");
    assertThat(
            screenOf(
                root.run(
                    io.mateu.dtos.RunActionRqDto.builder()
                        .route("/home")
                        .consumedRoute("")
                        .actionId("")
                        .initiatorComponentId("ux_root")
                        .build())))
        .isEqualTo(RootHome.class.getName());
  }
}
