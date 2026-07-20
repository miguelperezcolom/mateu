package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Reproduction harness for the CRS shell ↔ distribucion remote-menu bug (booking/out/modux).
 *
 * <p>Real topology:
 *
 * <ul>
 *   <li>Shell {@code CrsShellHome} is {@code @UI("")} carrying {@code new
 *       RemoteMenu("/_distribucion").withPath("/distribucion")} (baseUrl relative, route "",
 *       consumedRoute "_empty").
 *   <li>The remote {@code Home} is {@code @UI("/distribucion")} — a PATH-PREFIXED root — whose menu
 *       pages therefore live at {@code /distribucion/venta} and {@code
 *       /distribucion/disponibilidad}.
 *   <li>The shell menu path ({@code /distribucion}) COINCIDES with the remote's own @UI route.
 * </ul>
 *
 * <p>Symptom: navigating by menu works, but entering by URL shows the remote's OWN menu bar (its
 * app chrome) instead of only its content, and clicking a page loops, reloading the header forever.
 *
 * <p>The remote is faked over the {@link MateuHttpClient} port so we can watch every HTTP call the
 * shell makes to it (to catch the loop) and inspect which route the shell decides to MOUNT — the
 * bug is that it mounts a route the remote does not actually own.
 */
class RemoteMenuDeepLinkSyncTest {

  // ── The shell (mirrors CrsShellHome) ────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("")
  @Title("CRS")
  public static class ShellRoot {
    @Menu
    RemoteMenu distribucion =
        new RemoteMenu("/_distribucion").withLabel("distribucion").withPath("/distribucion");
  }

  // ── The faked distribucion remote (mirrors Home @UI("/distribucion")) ────────

  /** The routes the real distribucion app actually resolves (its @UI root + its two menu pages). */
  static final String REMOTE_APP_ROUTE = "/distribucion";

  static final Set<String> REMOTE_REAL_ROUTES =
      Set.of("/distribucion", "/distribucion/venta", "/distribucion/disponibilidad");

  public static class FakeDistribucion implements MateuHttpClient {
    static final List<Call> calls = new ArrayList<>();

    record Call(String baseUrl, String route, String consumedRoute, String serverSideType) {}

    static void reset() {
      calls.clear();
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      calls.add(
          new Call(baseUrl, request.route(), request.consumedRoute(), request.serverSideType()));
      if (calls.size() > 50) {
        throw new IllegalStateException(
            "Runaway remote resolution: > 50 HTTP calls in one request. Calls:\n" + render());
      }
      // The distribucion app descriptor: @UI("/distribucion") with two prefixed menu pages.
      var appDto =
          AppDto.builder()
              .route(REMOTE_APP_ROUTE)
              .title("Distribución")
              .homeConsumedRoute(REMOTE_APP_ROUTE)
              .homeServerSideType("crs.infra.in.ui.Home")
              .menu(
                  List.of(
                      menuOption("venta", "/distribucion/venta"),
                      menuOption("disponibilidad", "/distribucion/disponibilidad")))
              .build();
      var component =
          new ClientSideComponentDto(appDto, "distribucion_app", List.of(), null, null, null);
      var fragment = UIFragmentDto.builder().component(component).build();
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of(fragment)).build());
    }

    private static MenuOptionDto menuOption(String label, String route) {
      return MenuOptionDto.builder().label(label).path(route).route(route).build();
    }

    static String render() {
      var sb = new StringBuilder();
      for (int i = 0; i < calls.size(); i++) {
        var c = calls.get(i);
        sb.append("  #")
            .append(i + 1)
            .append(" baseUrl=")
            .append(c.baseUrl())
            .append(" route=")
            .append(c.route())
            .append(" consumedRoute=")
            .append(c.consumedRoute())
            .append(" serverSideType=")
            .append(c.serverSideType())
            .append('\n');
      }
      return sb.toString();
    }
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    FakeDistribucion.reset();
    mateu = TestMateu.withUisAndBeans(List.of(new FakeDistribucion()), ShellRoot.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Cold URL load: the browser lands on the URL with no resolved app (consumedRoute "_empty"). */
  private UIIncrementDto viaUrl(String route) {
    return mateu.run(
        RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  private static AppDto shellApp(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private static AppDto findApp(io.mateu.dtos.ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) {
        return app;
      }
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  private static AppDto report(String scenario, UIIncrementDto increment) {
    System.out.println("=== " + scenario + " ===");
    System.out.println("HTTP calls to remote: " + FakeDistribucion.calls.size());
    System.out.print(FakeDistribucion.render());
    var app = shellApp(increment);
    if (app == null) {
      System.out.println("Shell AppDto: <none found in increment>");
      return null;
    }
    System.out.println(
        "Shell home mount → homeBaseUrl="
            + app.homeBaseUrl()
            + " homeRoute="
            + app.homeRoute()
            + " homeServerSideType="
            + app.homeServerSideType()
            + " homeConsumedRoute="
            + app.homeConsumedRoute());
    var mounted = app.homeRoute();
    boolean remoteCanResolve = mounted != null && REMOTE_REAL_ROUTES.contains(mounted);
    System.out.println(
        "Mounted route \""
            + mounted
            + "\" is a REAL remote route? "
            + remoteCanResolve
            + (remoteCanResolve
                ? ""
                : "   ← BUG: remote will answer with its app-shell fallback → loop"));
    return app;
  }

  // ── The two ways in ──────────────────────────────────────────────────────────

  /** Enter at the remote app root by URL → must mount the remote's real home route. */
  @Test
  void viaUrl_remoteRoot() {
    var app = report("URL /distribucion (remote root)", viaUrl("/distribucion"));
    assertThat(FakeDistribucion.calls.size()).isLessThan(50);
    assertThat(app).isNotNull();
    // Regression: the mounted route must be one the remote actually resolves — never a stripped
    // route the remote answers with its app-shell fallback (which loops).
    assertThat(REMOTE_REAL_ROUTES).contains(app.homeRoute());
    assertThat(app.homeRoute()).isEqualTo("/distribucion");
  }

  /** Enter at a remote PAGE by URL → must mount the real page route, not the stripped one. */
  @Test
  void viaUrl_remotePage() {
    var app =
        report(
            "URL /distribucion/disponibilidad (remote page)",
            viaUrl("/distribucion/disponibilidad"));
    assertThat(FakeDistribucion.calls.size()).isLessThan(50);
    assertThat(app).isNotNull();
    // Regression: before the fix this mounted "/disponibilidad" (stripped shell prefix), which the
    // remote cannot resolve → app-shell fallback → reload loop.
    assertThat(REMOTE_REAL_ROUTES).contains(app.homeRoute());
    assertThat(app.homeRoute()).isEqualTo("/distribucion/disponibilidad");
  }
}
