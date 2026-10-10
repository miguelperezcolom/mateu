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
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * A deep link no local entry claims goes to the remote that owns it, chosen by LONGEST PREFIX —
 * from what the shell already knows (its cache, each remote's mount path) — instead of asking every
 * remote in turn. And a remote that is down claims nothing: it does not take the request with it.
 *
 * <p>Also the wire half of the same work: a remote section travels with the prefix its screens live
 * under ({@code routePrefix}) and with whether the shell declared its label ({@code shellLabel}),
 * so the renderer knows the active section and the first breadcrumb before any remote answers, and
 * knows whose label wins.
 */
class RemoteMenuPrefixSelectionSyncTest {

  static final List<String> CALLS = Collections.synchronizedList(new ArrayList<>());

  /** Each remote's own menu routes, declared from its own root (the usual federation layout). */
  static final Map<String, List<String>> ROUTES =
      Map.of(
          "/_workflow", List.of("/workflow/processes", "/workflow/steps"),
          "/_forms", List.of("/forms/tasks", "/forms/executions"),
          "/_forms-admin", List.of("/forms-admin/definitions", "/forms-admin/editor"),
          "/_inbox", List.of("/inbox/tasks"));

  /** Answers with the menu above; {@code /_dead} is a remote that is down. */
  public static class Remotes implements MateuHttpClient {
    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      var base = baseUrl.replace("http://localhost:8080/", "/");
      CALLS.add(base);
      if (base.equals("/_dead")) {
        return CompletableFuture.failedFuture(new java.net.ConnectException("Connection refused"));
      }
      var name = base.substring(2);
      var routes = ROUTES.getOrDefault(base, List.of());
      var appDto =
          AppDto.builder()
              .route("")
              .title(name)
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType(name + ".Home")
              .menu(
                  List.of(
                      MenuOptionDto.builder()
                          .label(name)
                          .path("/" + name)
                          .route("/" + name)
                          .submenus(
                              routes.stream()
                                  .map(
                                      route ->
                                          MenuOptionDto.builder()
                                              .label(route)
                                              .path(route)
                                              .route(route)
                                              .build())
                                  .toList())
                          .build()))
              .build();
      var component =
          new ClientSideComponentDto(appDto, name + "_app", List.of(), null, null, null);
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder()
              .fragments(List.of(UIFragmentDto.builder().component(component).build()))
              .build());
    }
  }

  /** The group: its remotes sit under "/admin", while their screens live under their own root. */
  @SuppressWarnings("unused")
  public static class AdminMenu {
    @Menu RemoteMenu dead = new RemoteMenu("/_dead").withLabel("Dead");

    @Menu RemoteMenu workflow = new RemoteMenu("/_workflow").withLabel("Workflow");

    @Menu RemoteMenu forms = new RemoteMenu("/_forms");
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Console")
  public static class Shell {
    @Menu AdminMenu admin = new AdminMenu();

    // Named after what it administers, not after the routes it serves: its prefix is not derivable
    // from the field, so a deep link to it has to ask.
    @Menu
    @Label("Forms admin")
    RemoteMenu formsAdmin = new RemoteMenu("/_forms-admin");

    @Menu @Hidden RemoteMenu inbox = new RemoteMenu("/_inbox");
  }

  TestMateu mateu;

  private void boot(Class<?> ui) {
    CALLS.clear();
    mateu = TestMateu.withUisAndBeans(List.of(new Remotes()), ui);
  }

  @AfterEach
  void shutdown() {
    if (mateu != null) {
      mateu.close();
    }
  }

  private AppDto viaUrl(String route) {
    return shellApp(
        mateu.run(
            RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build()));
  }

  @Test
  void aGroupedRemoteIsChosenByItsPrefixWithoutAskingTheOthers() {
    boot(Shell.class);

    var app = viaUrl("/forms/tasks");

    assertThat(app.homeBaseUrl()).isEqualTo("/_forms");
    assertThat(app.homeRoute()).isEqualTo("/forms/tasks");
    // /_dead and /_workflow are declared before it, and used to be asked first, one by one.
    assertThat(CALLS).containsExactly("/_forms");
  }

  @Test
  void aRecordUnderTheRemoteGoesToTheSameRemote() {
    boot(Shell.class);

    var app = viaUrl("/workflow/processes/p-42");

    assertThat(app.homeBaseUrl()).isEqualTo("/_workflow");
    assertThat(app.homeRoute()).isEqualTo("/workflow/processes/p-42");
    assertThat(CALLS).containsExactly("/_workflow");
  }

  @Test
  void aRemoteWhosePrefixIsNotKnownIsFoundByAskingTheRestTogether() {
    boot(Shell.class);

    // The field is formsAdmin; its screens live under /forms-admin. Nothing the shell knows says
    // so, so every remote is asked at once, and the one that claims the route is mounted.
    var app = viaUrl("/forms-admin/definitions");

    assertThat(app.homeBaseUrl()).isEqualTo("/_forms-admin");
    assertThat(app.homeRoute()).isEqualTo("/forms-admin/definitions");
    // the dead remote was asked too, and its failure stayed with it
    assertThat(CALLS).contains("/_forms", "/_forms-admin", "/_dead");
  }

  @Test
  void whatTheCacheKnowsDecidesWithoutAskingAgain() {
    boot(Shell.class);
    viaUrl("/forms-admin/definitions");
    CALLS.clear();

    var app = viaUrl("/forms-admin/editor");

    // Every remote's menu is cached now (but the dead one's): the admin remote's claim is known,
    // it is chosen straight away, and nobody is asked.
    assertThat(app.homeBaseUrl()).isEqualTo("/_forms-admin");
    assertThat(CALLS).isEmpty();
  }

  @Test
  void aRouteNoRemoteClaimsLeavesTheShellAloneEvenWithARemoteDown() {
    boot(Shell.class);

    var app = viaUrl("/nowhere/at-all");

    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isNotEqualTo("/_dead");
  }

  @Test
  void aHiddenRemoteStillResolvesItsDeepLinks() {
    boot(Shell.class);

    var app = viaUrl("/inbox/tasks");

    assertThat(app.homeBaseUrl()).isEqualTo("/_inbox");
  }

  // ── the wire ────────────────────────────────────────────────────────────────────────────────

  @Test
  void aRemoteSectionTravelsWithItsPrefixAndWhetherTheShellNamedIt() {
    boot(Shell.class);

    var menu = viaUrl("").menu();
    var admin = find(menu, "/admin");
    var forms = find(admin.submenus(), "/admin/forms");
    var workflow = find(admin.submenus(), "/admin/workflow");
    var formsAdmin = find(menu, "/formsAdmin");
    var inbox = find(menu, "/inbox");

    // the prefix is the remote's own path, not the group's: its screens live under /forms
    assertThat(forms.routePrefix()).isEqualTo("/forms");
    assertThat(workflow.routePrefix()).isEqualTo("/workflow");
    assertThat(inbox.routePrefix()).isEqualTo("/inbox");
    assertThat(inbox.visible()).isFalse();
    // withLabel and @Label are the shell's word; the field name is only a stand-in
    assertThat(workflow.shellLabel()).isTrue();
    assertThat(formsAdmin.label()).isEqualTo("Forms admin");
    assertThat(formsAdmin.shellLabel()).isTrue();
    assertThat(forms.label()).isEqualTo("Forms");
    assertThat(forms.shellLabel()).isFalse();
    // a local group is not a remote section
    assertThat(admin.routePrefix()).isNull();
    assertThat(admin.shellLabel()).isFalse();
  }

  // ── the variant ─────────────────────────────────────────────────────────────────────────────

  @Test
  void anAutoShellWithRemotesIsStillDrawnMenuOnTop() {
    // Eight entries with a group used to resolve to the hamburger, and the browser forced
    // MENU_ON_TOP on top of it. The browser no longer forces anything; AUTO keeps the look.
    boot(Shell.class);

    assertThat(viaUrl("").variant()).isEqualTo(io.mateu.dtos.AppVariantDto.MENU_ON_TOP);
  }

  @SuppressWarnings("unused")
  @UI("")
  @App(AppVariant.TABS)
  public static class TabsShell {
    @Menu RemoteMenu workflow = new RemoteMenu("/_workflow").withLabel("Workflow");
  }

  @Test
  void aDeclaredVariantIsRespected() {
    boot(TabsShell.class);

    assertThat(viaUrl("").variant()).isEqualTo(io.mateu.dtos.AppVariantDto.TABS);
  }

  @Test
  void aFluentShellWithRemotesAndNoVariantKeepsMenuOnTop() {
    var withRemote = AppShell.builder().menuItem(new RemoteMenu("/_workflow")).build();
    var grouped =
        AppShell.builder()
            .menuItem(
                new io.mateu.uidl.data.Menu(
                    "/admin", "Admin", List.of(new RemoteMenu("/_workflow"))))
            .build();
    var local = AppShell.builder().build();
    var declared =
        AppShell.builder()
            .menuItem(new RemoteMenu("/_workflow"))
            .variant(AppVariant.HAMBURGUER_MENU)
            .build();

    assertThat(withRemote.variant()).isEqualTo(AppVariant.MENU_ON_TOP);
    assertThat(grouped.variant()).isEqualTo(AppVariant.MENU_ON_TOP);
    assertThat(local.variant()).isEqualTo(AppVariant.TABS);
    assertThat(declared.variant()).isEqualTo(AppVariant.HAMBURGUER_MENU);
  }

  // ── helpers ─────────────────────────────────────────────────────────────────────────────────

  private static MenuOptionDto find(List<MenuOptionDto> menu, String path) {
    return menu.stream()
        .filter(option -> path.equals(option.path()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no menu option at " + path + " in " + menu));
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
}
