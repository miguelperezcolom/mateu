package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A route that REPEATS the mount it is sent to ({@code /e2-demo/page} to the {@code /e2-demo}
 * controller) is the same place as {@code /page} — but only on a fresh load of the app itself:
 * never when a consumed route says where we are, when the request names another type, when the base
 * url is an absolute remote, or when the app has a menu entry called like the mount.
 */
class MountPrefixedRoutesTest {

  @UI("/e2-demo")
  public static class Demo {
    @Menu String page = "/page";
  }

  @UI("/e2-demo")
  public static class DemoWithMenuNamedLikeTheMount {
    @Menu String e2Demo = "/e2-demo/x";
  }

  @UI("/elsewhere")
  public static class Elsewhere {
    @Menu String page = "/page";
  }

  private static RunActionCommand command(
      String baseUrl, String uiId, String route, String consumed, String serverSideType) {
    return new RunActionCommand(
        baseUrl, uiId, route, consumed, "", Map.of(), Map.of(), null, null, serverSideType, null);
  }

  private static final String DEMO = Demo.class.getName();

  @Test
  void aRouteRepeatingTheMountIsRelativizedOnAFreshLoad() {
    assertThat(
            MountPrefixedRoutes.relativeRoute(command("/e2-demo", DEMO, "/e2-demo/page", "", null)))
        .isEqualTo("/page");
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("/e2-demo/", DEMO, "/e2-demo/page", "_empty", DEMO)))
        .isEqualTo("/page");
    var relativized =
        MountPrefixedRoutes.relativize(command("/e2-demo", DEMO, "/e2-demo/page", null, null));
    assertThat(relativized.route()).isEqualTo("/page");
  }

  @Test
  void itIsLeftAloneWheneverSomethingElseSaysWhereWeAre() {
    // a consumed route: the shell already knows where it is
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("/e2-demo", DEMO, "/e2-demo/page", "/e2-demo", null)))
        .isNull();
    // the request names another type
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("/e2-demo", DEMO, "/e2-demo/page", "", "com.acme.Other")))
        .isNull();
    // no app named, or one that does not exist
    assertThat(
            MountPrefixedRoutes.relativeRoute(command("/e2-demo", "", "/e2-demo/page", "", null)))
        .isNull();
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("/e2-demo", "com.acme.Missing", "/e2-demo/page", "", null)))
        .isNull();
    // the app is mounted somewhere else
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("/e2-demo", Elsewhere.class.getName(), "/e2-demo/page", "", null)))
        .isNull();
    // a menu entry called like the mount segment is a real sub-route
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command(
                    "/e2-demo",
                    DemoWithMenuNamedLikeTheMount.class.getName(),
                    "/e2-demo/x",
                    "",
                    null)))
        .isNull();
  }

  @Test
  void rootRemoteAndUnrelatedBaseUrlsNeverRelativize() {
    assertThat(MountPrefixedRoutes.relativeRoute(command("", DEMO, "/e2-demo/page", "", null)))
        .isNull();
    assertThat(MountPrefixedRoutes.relativeRoute(command("/", DEMO, "/e2-demo/page", "", null)))
        .isNull();
    assertThat(
            MountPrefixedRoutes.relativeRoute(
                command("https://remote.example.com/e2-demo", DEMO, "/e2-demo/page", "", null)))
        .isNull();
    assertThat(MountPrefixedRoutes.relativeRoute(command(null, DEMO, "/e2-demo/page", "", null)))
        .isNull();
    assertThat(
            MountPrefixedRoutes.relativeRoute(command("/e2-demo", DEMO, "/other/page", "", null)))
        .isNull();
    assertThat(MountPrefixedRoutes.relativeRoute(command("/e2-demo", DEMO, null, "", null)))
        .isNull();
    var untouched = command("/e2-demo", DEMO, "/page", "", null);
    assertThat(MountPrefixedRoutes.relativize(untouched)).isSameAs(untouched);
  }
}
