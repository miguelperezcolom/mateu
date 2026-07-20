package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Root deep-link into a remote menu (booking CRS shell ↔ distribucion). {@link TestMateu} runs the
 * WHOLE server side — route resolution, RemoteMenuHandler AND the downstream AppHomeRouteResolver /
 * ReflectionAppMapper that recompute the shell's home mount — so the home route/consumedRoute this
 * asserts is exactly what the frontend receives.
 *
 * <p>The remote is faked over the {@link MateuHttpClient} port with the SHAPE the live distribucion
 * actually returns (verified against the running app): fetched at the RemoteMenu's own route ("")
 * the remote answers an AppDto with route "", homeRoute "_no_home_route" (it has no home at that
 * route), homeConsumedRoute "" and UNPREFIXED menu routes ("/venta", "/disponibilidad").
 *
 * <p>Bug: entering "/distribucion" by URL mounted route ""/consumedRoute "_empty" (or a
 * "_no_home_route" route), which makes the remote answer with its whole app shell — its chrome and
 * menu nested inside the shell, looping on navigation. The fix mounts the shell menu path as the
 * home route/consumedRoute so the remote renders its home CONTENT instead.
 */
class RemoteMenuRootDeepLinkSyncTest {

  @SuppressWarnings("unused")
  @UI("")
  @Title("CRS")
  public static class ShellRoot {
    @Menu
    RemoteMenu distribucion =
        new RemoteMenu("/_distribucion").withLabel("distribucion").withPath("/distribucion");
  }

  /** Mirrors the live distribucion descriptor as returned when fetched at route "". */
  public static class FakeDistribucion implements MateuHttpClient {
    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      var appDto =
          AppDto.builder()
              .route("")
              .title("Distribución")
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("crs.infra.in.ui.Home")
              .menu(
                  List.of(
                      MenuOptionDto.builder().label("Venta").path("/venta").route("/venta").build(),
                      MenuOptionDto.builder()
                          .label("Disponibilidad")
                          .path("/disponibilidad")
                          .route("/disponibilidad")
                          .build()))
              .build();
      var component =
          new ClientSideComponentDto(appDto, "distribucion_app", List.of(), null, null, null);
      var fragment = UIFragmentDto.builder().component(component).build();
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of(fragment)).build());
    }
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new FakeDistribucion()), ShellRoot.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
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

  private static AppDto findApp(ComponentDto component) {
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

  private UIIncrementDto viaUrl(String route) {
    return mateu.run(
        RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  @Test
  void rootDeepLinkMountsHomeContentNotNestedAppShell() {
    var app = shellApp(viaUrl("/distribucion"));
    System.out.println(
        "ROOT /distribucion → homeRoute="
            + (app == null ? "<no app>" : app.homeRoute())
            + " homeConsumedRoute="
            + (app == null ? "" : app.homeConsumedRoute())
            + " homeBaseUrl="
            + (app == null ? "" : app.homeBaseUrl()));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_distribucion");
    // The home the frontend loads must NOT be an unresolved marker (which loads the remote's whole
    // app shell → nested chrome + loop). Consuming the shell menu path renders the remote's
    // content.
    assertThat(app.homeRoute()).isNotIn("_no_home_route", "_page", "");
    assertThat(app.homeRoute()).isEqualTo("/distribucion");
    assertThat(app.homeConsumedRoute()).isEqualTo("/distribucion");
  }

  @Test
  void pageDeepLinkStillResolvesTheRemotePage() {
    var app = shellApp(viaUrl("/distribucion/disponibilidad"));
    System.out.println(
        "PAGE /distribucion/disponibilidad → homeRoute="
            + (app == null ? "<no app>" : app.homeRoute())
            + " homeConsumedRoute="
            + (app == null ? "" : app.homeConsumedRoute()));
    assertThat(app).isNotNull();
    assertThat(app.homeRoute()).isEqualTo("/disponibilidad");
  }
}
