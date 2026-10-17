package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Submenu;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * A NON-ROOT {@code @UI("/e2-demo")} app whose {@code @Menu} entries are typed with PAGE classes
 * (view models) — plus a nested group and a route-typed entry — and the same shapes on a ROOT app.
 *
 * <p>Requests are sent exactly as the generated controller of each mount sends them (its own {@code
 * uiId} and {@code baseUrl}) and in the order the browser makes them: the shell ({@code
 * consumedRoute=_empty}), then the content the shell points at (its {@code homeRoute} / {@code
 * homeConsumedRoute}, typed with the app). A loop is the content answering the APP again.
 *
 * <p>The bug: a route that repeats the mount it was sent to ({@code /e2-demo/page} to the {@code
 * /e2-demo} controller — what a link, a {@code NavigateTo} or a client composing the URL path
 * sends) resolved its prefix to the app itself, so the app was answered for its own content with
 * that same route as its home, and no menu entry was ever selected: the client reloaded the shell
 * forever. A root app has an empty base url, so it never had a second spelling of its routes.
 */
class NonRootAppMenuSyncTest {

  static final String PLAIN = "io.mateu.core.application.NonRootAppMenuSyncTest$PlainPage";
  static final String MONTHLY = "io.mateu.core.application.NonRootAppMenuSyncTest$MonthlyPage";
  static final String ROUTED = "io.mateu.core.application.NonRootAppMenuSyncTest$RoutedPage";

  @Title("Plain page")
  public static class PlainPage {
    String value = "plain";
  }

  @Title("Monthly")
  public static class MonthlyPage {
    String value = "monthly";
  }

  /**
   * @Menu targets fields; a method entry is declared through a composed annotation.
   */
  @Menu
  @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
  @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
  @interface MenuMethod {}

  static final String SUMMARY = "io.mateu.core.application.NonRootAppMenuSyncTest$SummaryPage";

  @Title("Summary")
  public static class SummaryPage {
    String value = "summary";
  }

  @UI("/elsewhere")
  @Title("Routed page")
  public static class RoutedPage {
    String value = "routed";
  }

  @UI("/e2-demo/other")
  @Title("Other page")
  public static class OtherPage {
    String value = "other";
  }

  @UI("/root-other")
  @Title("Root other page")
  public static class RootOtherPage {
    String value = "root other";
  }

  public static class Reports implements Submenu {
    @Menu MonthlyPage monthly;
  }

  @UI("/e2-demo")
  @Title("E2 demo")
  public static class NonRootApp {
    @Menu PlainPage page;

    @Menu Reports reports;

    @Menu RoutedPage routed;

    // route-typed: the route this controller resolves for the entry (/other) is /e2-demo/other
    @Menu String other = "/e2-demo/other";

    // a METHOD entry: its path is relative to the app, like a field's (it used to carry the mount
    // already, which the menu builder then prepended again: /e2-demo/e2-demo/summary)
    @MenuMethod
    public SummaryPage summary() {
      return new SummaryPage();
    }
  }

  @UI("")
  @Title("Root")
  public static class RootApp {
    @Menu PlainPage page;

    @Menu Reports reports;

    @Menu RoutedPage routed;

    @Menu String rootOther = "/root-other";

    @MenuMethod
    public SummaryPage summary() {
      return new SummaryPage();
    }
  }

  record Mount(TestMateu mateu, Class<?> app, String baseUrl) {

    UIIncrementDto run(RunActionRqDto rq) {
      try {
        var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", baseUrl);
        httpRequest.setAttribute("uiId", app.getName());
        return mateu.service().runAction(app.getName(), rq, baseUrl, httpRequest).blockFirst();
      } catch (Throwable t) {
        throw new AssertionError(t);
      }
    }

    /** A page load: what the browser asks for when the URL is opened (deep link or reload). */
    UIIncrementDto shell(String route) {
      return run(
          RunActionRqDto.builder()
              .route(route)
              .consumedRoute("_empty")
              .actionId("")
              .initiatorComponentId("_ux")
              .build());
    }

    /** The content load inside the shell: a menu click, or the shell following its home. */
    UIIncrementDto content(String route, String consumedRoute) {
      return run(
          RunActionRqDto.builder()
              .route(route)
              .consumedRoute(consumedRoute)
              .serverSideType(app.getName())
              .actionId("")
              .initiatorComponentId("ux_root")
              .build());
    }
  }

  static Optional<AppDto> appOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ClientSideComponentDto)
        .map(component -> ((ClientSideComponentDto) component).metadata())
        .filter(metadata -> metadata instanceof AppDto)
        .map(metadata -> (AppDto) metadata)
        .findFirst();
  }

  static String screenOf(UIIncrementDto increment) {
    assertThat(appOf(increment)).as("the content answered the app shell again (a loop)").isEmpty();
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ServerSideComponentDto)
        .map(component -> ((ServerSideComponentDto) component).serverSideType())
        .findFirst()
        .orElseThrow(() -> new AssertionError("no screen in " + increment));
  }

  static List<String> selected(AppDto app) {
    return app.menu().stream().filter(MenuOptionDto::selected).map(MenuOptionDto::path).toList();
  }

  static MenuOptionDto entryRoutedTo(AppDto app, String route) {
    return app.menu().stream()
        .flatMap(entry -> Stream.concat(Stream.of(entry), entry.submenus().stream()))
        .filter(entry -> route.equals(entry.route()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no menu entry routed to " + route));
  }

  @Nested
  @TestInstance(TestInstance.Lifecycle.PER_CLASS)
  class OnANonRootMount {

    TestMateu mateu;
    Mount mount;

    @BeforeAll
    void boot() {
      mateu = TestMateu.withUis(NonRootApp.class, RoutedPage.class, OtherPage.class);
      mount = new Mount(mateu, NonRootApp.class, "/e2-demo");
    }

    @AfterAll
    void shutdown() {
      mateu.close();
    }

    @ParameterizedTest
    @CsvSource({
      "/page, /page, " + PLAIN,
      "/reports/monthly, /reports, " + MONTHLY,
      "/routed, /routed, " + ROUTED,
      "/other, /other, io.mateu.core.application.NonRootAppMenuSyncTest$OtherPage",
      "/summary, /summary, " + SUMMARY
    })
    void aDeepLinkOrReloadLandsOnThePageWithItsEntrySelected(
        String route, String selectedEntry, String screen) {
      var app = appOf(mount.shell(route)).orElseThrow();
      assertThat(app.homeRoute()).isEqualTo(route);
      assertThat(selected(app)).containsExactly(selectedEntry);
      assertThat(screenOf(mount.content(app.homeRoute(), app.homeConsumedRoute())))
          .isEqualTo(screen);
    }

    @ParameterizedTest
    @CsvSource({
      "/page, " + PLAIN,
      "/reports/monthly, " + MONTHLY,
      "/routed, " + ROUTED,
      "/other, io.mateu.core.application.NonRootAppMenuSyncTest$OtherPage",
      "/summary, " + SUMMARY
    })
    void aMenuClickLoadsThePageInsideTheShell(String route, String screen) {
      var option = entryRoutedTo(appOf(mount.shell("")).orElseThrow(), route);
      assertThat(screenOf(mount.content(option.route(), option.consumedRoute()))).isEqualTo(screen);
    }

    @ParameterizedTest
    @CsvSource({
      "/e2-demo/page, /page, " + PLAIN,
      "/e2-demo/reports/monthly, /reports/monthly, " + MONTHLY,
      "/e2-demo/routed, /routed, " + ROUTED
    })
    void aRouteRepeatingTheMountIsTheSamePlaceNotTheAppAgain(
        String prefixed, String relative, String screen) {
      // the deep link (and its reload): the shell is pointed at the relative route…
      var app = appOf(mount.shell(prefixed)).orElseThrow();
      assertThat(app.homeRoute()).isEqualTo(relative);
      assertThat(selected(app)).isNotEmpty();
      assertThat(screenOf(mount.content(app.homeRoute(), app.homeConsumedRoute())))
          .isEqualTo(screen);
      // …and a content load with the prefixed route renders the page, not the shell once more
      assertThat(screenOf(mount.content(prefixed, ""))).isEqualTo(screen);
    }

    @Test
    void theMountRootStillRendersTheShell() {
      var app = appOf(mount.shell("")).orElseThrow();
      assertThat(app.serverSideType()).isEqualTo(NonRootApp.class.getName());
    }
  }

  @Nested
  @TestInstance(TestInstance.Lifecycle.PER_CLASS)
  class OnANonRootMountServedByCompiledRouteResolvers {

    // WebFlux, Quarkus and Helidon serve each @UI through a pre-compiled RouteResolver matching the
    // mount's ABSOLUTE path (/e2-demo/other), not through a RoutedClassProvider whose matcher
    // composes the base url. The route-typed entry dispatches the route RELATIVE to the mount
    // (/other) — and found nothing on those adapters ("Note" never showed in the e2e).
    TestMateu mateu;
    Mount mount;

    @BeforeAll
    void boot() {
      mateu = TestMateu.withCompiledRouteResolvers(NonRootApp.class, OtherPage.class);
      mount = new Mount(mateu, NonRootApp.class, "/e2-demo");
    }

    @AfterAll
    void shutdown() {
      mateu.close();
    }

    @Test
    void aRouteTypedEntryNamingANestedMountLoadsThatPage() {
      var option = entryRoutedTo(appOf(mount.shell("")).orElseThrow(), "/other");
      assertThat(screenOf(mount.content(option.route(), option.consumedRoute())))
          .isEqualTo("io.mateu.core.application.NonRootAppMenuSyncTest$OtherPage");
    }
  }

  @Nested
  @TestInstance(TestInstance.Lifecycle.PER_CLASS)
  class OnTheRootMount {

    TestMateu mateu;
    Mount mount;

    @BeforeAll
    void boot() {
      // a root app changes route resolution for every other fixture: its own harness
      mateu = TestMateu.withUis(RootApp.class, RoutedPage.class, RootOtherPage.class);
      mount = new Mount(mateu, RootApp.class, "");
    }

    @AfterAll
    void shutdown() {
      mateu.close();
    }

    @ParameterizedTest
    @CsvSource({
      "/page, /page, " + PLAIN,
      "/reports/monthly, /reports, " + MONTHLY,
      "/routed, /routed, " + ROUTED,
      "/rootOther, /rootOther, io.mateu.core.application.NonRootAppMenuSyncTest$RootOtherPage",
      "/summary, /summary, " + SUMMARY
    })
    void aDeepLinkOrReloadLandsOnThePageWithItsEntrySelected(
        String route, String selectedEntry, String screen) {
      var app = appOf(mount.shell(route)).orElseThrow();
      assertThat(selected(app)).containsExactly(selectedEntry);
      assertThat(screenOf(mount.content(app.homeRoute(), app.homeConsumedRoute())))
          .isEqualTo(screen);
    }

    @ParameterizedTest
    @CsvSource({
      "/page, " + PLAIN,
      "/reports/monthly, " + MONTHLY,
      "/routed, " + ROUTED,
      "/rootOther, io.mateu.core.application.NonRootAppMenuSyncTest$RootOtherPage",
      "/summary, " + SUMMARY
    })
    void aMenuClickLoadsThePageInsideTheShell(String route, String screen) {
      var option = entryRoutedTo(appOf(mount.shell("")).orElseThrow(), route);
      assertThat(screenOf(mount.content(option.route(), option.consumedRoute()))).isEqualTo(screen);
    }
  }

  @Nested
  @TestInstance(TestInstance.Lifecycle.PER_CLASS)
  class ThroughASingleEndpoint {

    // The harness's default frame: one endpoint, an empty base url, ABSOLUTE routes. The shell says
    // where the app is mounted (homeConsumedRoute) and selects the entry the route names below it.
    TestMateu mateu;

    @BeforeAll
    void boot() {
      mateu = TestMateu.withUis(NonRootApp.class, RoutedPage.class, OtherPage.class);
    }

    @AfterAll
    void shutdown() {
      mateu.close();
    }

    @ParameterizedTest
    @CsvSource({
      "/e2-demo/page, /page, " + PLAIN,
      "/e2-demo/reports/monthly, /reports, " + MONTHLY,
      "/e2-demo/routed, /routed, " + ROUTED,
      "/e2-demo/summary, /summary, " + SUMMARY
    })
    void anAbsoluteDeepLinkSelectsTheEntryAndLandsOnThePage(
        String route, String selectedEntry, String screen) {
      var app = appOf(mateu.sync(route)).orElseThrow();
      assertThat(app.homeConsumedRoute()).isEqualTo("/e2-demo");
      assertThat(selected(app)).containsExactly(selectedEntry);
      var content =
          mateu.run(
              RunActionRqDto.builder()
                  .route(app.homeRoute())
                  .consumedRoute(app.homeConsumedRoute())
                  .serverSideType(NonRootApp.class.getName())
                  .actionId("")
                  .build());
      assertThat(screenOf(content)).isEqualTo(screen);
    }

    @Test
    void aMethodEntryOfTheMenuIsRoutedOnceUnderTheMount() {
      var app = appOf(mateu.sync("/e2-demo")).orElseThrow();
      var option =
          app.menu().stream()
              .filter(entry -> "Summary".equals(entry.label()))
              .findFirst()
              .orElseThrow();
      // relative to the app, like the field entries (it was /e2-demo/summary → /e2-demo/e2-demo)
      assertThat(option.path()).isEqualTo("/summary");
      var content =
          mateu.run(
              RunActionRqDto.builder()
                  .route(option.route())
                  .consumedRoute(option.consumedRoute())
                  .serverSideType(NonRootApp.class.getName())
                  .actionId("")
                  .build());
      assertThat(screenOf(content)).isEqualTo(SUMMARY);
    }
  }
}
