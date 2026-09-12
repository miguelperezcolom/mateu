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
 * Deep-link into a remote that sits INSIDE a menu group — the other axis of {@link
 * RemoteMenuPrefixedDeepLinkSyncTest}, whose remote is declared at the top level.
 *
 * <p>Real case: the EventConductor demo console. Its shell groups the platform sections under one
 * entry — {@code @Menu AdminMenu admin} holding Workflow, Forms and Worker — so the forms service's
 * {@code RemoteMenu("/_forms")} is nested below the group, not on the bar. Clicking the entry
 * always worked (the frontend's menu completion descends into groups). Reloading or bookmarking
 * {@code /forms/tasks} did not: the deep-link resolver looked at the top-level menu only, never
 * offered the route to the nested remote, and the page fell through to the shell as "Not found" —
 * with {@code homeBaseUrl} left empty because the shell claimed the route as its own.
 *
 * <p>{@link TestMateu} runs the whole server side, so the mounted home asserted here is what the
 * frontend receives.
 */
class RemoteMenuNestedInGroupDeepLinkSyncTest {

  /** A menu group (field type annotated with {@code @Menu} fields) — label/path "/admin". */
  @SuppressWarnings("unused")
  public static class AdminMenu {
    @Menu RemoteMenu forms = new RemoteMenu("/_forms");
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Demo Console")
  public static class ShellRoot {
    // The remote lives UNDER this group, so its menu path becomes "/admin/forms" — while the remote
    // still declares its own routes as "/forms/...". The top-level bar carries no remote at all.
    @Menu AdminMenu admin = new AdminMenu();
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
  void pageDeepLinkIntoAGroupedRemoteMountsTheRemoteNotTheShell() {
    var app = shellApp(viaUrl("/forms/tasks"));
    assertThat(app).isNotNull();
    // The bug: a nested remote was never tried, so the shell claimed the route and mounted it with
    // an EMPTY baseUrl (itself) — which has no such route, hence "Not found".
    assertThat(app.homeBaseUrl()).isEqualTo("/_forms");
    assertThat(app.homeRoute()).isEqualTo("/forms/tasks");
  }

  @Test
  void recordDeepLinkIntoAGroupedRemoteMountsTheRouteBelowTheListing() {
    var app = shellApp(viaUrl("/forms/tasks/t-42"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_forms");
    assertThat(app.homeRoute()).isEqualTo("/forms/tasks/t-42");
  }
}
