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
 * Deep-link into a remote whose menu routes are PREFIXED with the shell's menu path — the other
 * half of {@link RemoteMenuRootDeepLinkSyncTest}, whose remote declares them unprefixed.
 *
 * <p>Real case: the EventConductor demo console. Its shell declares {@code @Menu RemoteMenu forms =
 * new RemoteMenu("/_forms")} (menu path {@code /forms}, the field name) and the forms service
 * declares its own routes as {@code /forms/tasks} — the SAME prefix, so stripping it by convention
 * mounted {@code /tasks}, a route the remote does not have, and the page rendered "Not found."
 * Clicking that entry in the menu worked all along: the menu option carries the remote's route
 * verbatim and the browser calls the remote directly, so only the URL/deep-link path (resolved
 * server-to-server by the shell) went through the stripping.
 *
 * <p>{@link TestMateu} runs the whole server side, so the mounted home asserted here is what the
 * frontend receives.
 */
class RemoteMenuPrefixedDeepLinkSyncTest {

  @SuppressWarnings("unused")
  @UI("")
  @Title("Demo Console")
  public static class ShellRoot {
    // No withPath(): the menu path defaults to the field name, "/forms" — which is also the prefix
    // the remote uses for its own routes.
    @Menu RemoteMenu forms = new RemoteMenu("/_forms");
  }

  /** A remote that declares its routes WITH the /forms prefix (like the demo's forms service). */
  public static class FakeForms implements MateuHttpClient {
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
              .title("Forms")
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("io.mateu.workflow.infra.in.ui.FormsHome")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label("Forms")
                          .path("/forms")
                          .route("/forms")
                          .submenus(
                              List.of(
                                  MenuOptionDto.builder()
                                      .label("Tasks")
                                      .path("/forms/tasks")
                                      .route("/forms/tasks")
                                      .build()))
                          .build()))
              .build();
      var component = new ClientSideComponentDto(appDto, "forms_app", List.of(), null, null, null);
      var fragment = UIFragmentDto.builder().component(component).build();
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder().fragments(List.of(fragment)).build());
    }
  }

  static TestMateu mateu;

  @BeforeEach
  void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new FakeForms()), ShellRoot.class);
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
  void pageDeepLinkMountsTheRouteTheRemoteDeclares() {
    var app = shellApp(viaUrl("/forms/tasks"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_forms");
    // NOT "/tasks": the remote's menu says "/forms/tasks", and mounting the stripped route made the
    // remote answer "Not found." while the very same screen opened fine from the menu.
    assertThat(app.homeRoute()).isEqualTo("/forms/tasks");
  }

  @Test
  void rootDeepLinkStillMountsTheMenuPathAsHomeContent() {
    var app = shellApp(viaUrl("/forms"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_forms");
    assertThat(app.homeRoute()).isNotIn("_no_home_route", "_page", "");
    assertThat(app.homeRoute()).isEqualTo("/forms");
    assertThat(app.homeConsumedRoute()).isEqualTo("/forms");
  }
}
