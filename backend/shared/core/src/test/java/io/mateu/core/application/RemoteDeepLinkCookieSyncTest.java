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
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A deep link into a remote of a system that signs its users in with a COOKIE — a session, or a
 * signed single-sign-on cookie every service accepts — rather than an {@code Authorization} header.
 *
 * <p>The shape modux generates: a shell behind an API gateway, two apps of one service mounted as
 * relative remotes ({@code /_catalog}, {@code /_catalog-reports}) that both hold {@code /concerts}.
 * The browser asks those remotes for their menus itself, cookie included, so the menu works. On a
 * reload or a pasted link the SHELL asks them, and it used to forward the {@code Authorization}
 * header only: every remote answered 401, none claimed the route, and the page said "Page not
 * found".
 */
class RemoteDeepLinkCookieSyncTest {

  static final String SESSION = "MODUX_AUTH=signed-user-token; theme=dark";

  @SuppressWarnings("unused")
  @UI("")
  @Title("Tickets")
  public static class Shell {
    @Menu
    RemoteMenu catalog = new RemoteMenu("/_catalog").withLabel("Catalog").withPath("/catalog");

    @Menu
    RemoteMenu catalogReports =
        new RemoteMenu("/_catalog-reports")
            .withLabel("Catalog reports")
            .withPath("/catalog-reports");

    /** Another host: it claims nothing here, and is never handed the shell's cookies. */
    @Menu
    RemoteMenu partner =
        new RemoteMenu("https://partner.example/app").withLabel("Partner").withPath("/partner");
  }

  /** What a remote was sent. */
  record Call(String baseUrl, Map<String, String> headers) {}

  /** Remotes behind the same login: they answer only a caller carrying the session cookie. */
  public static class CookieSecuredRemotes implements MateuHttpClient {
    final List<Call> calls = new CopyOnWriteArrayList<>();

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      return sendWithHeaders(
          baseUrl,
          request,
          authorization == null ? Map.of() : Map.of("Authorization", authorization));
    }

    @Override
    public CompletableFuture<UIIncrementDto> sendWithHeaders(
        String baseUrl, RunActionRqDto request, Map<String, String> headers) {
      calls.add(new Call(baseUrl, Map.copyOf(headers)));
      if (!SESSION.equals(headers.get("Cookie"))) {
        return CompletableFuture.failedFuture(
            new RuntimeException("HTTP 401 from " + baseUrl + "/mateu/v3/sync/_no_route"));
      }
      var routes = baseUrl.contains("partner") ? List.of("/elsewhere") : List.of("/concerts");
      var appDto =
          AppDto.builder()
              .route("")
              .title(baseUrl)
              .homeRoute("_no_home_route")
              .homeConsumedRoute("")
              .homeServerSideType("remote.Home")
              .menu(
                  routes.stream()
                      .map(r -> MenuOptionDto.builder().label(r).path(r).route(r).build())
                      .toList())
              .build();
      var component = new ClientSideComponentDto(appDto, "remote_app", List.of(), null, null, null);
      return CompletableFuture.completedFuture(
          UIIncrementDto.builder()
              .fragments(List.of(UIFragmentDto.builder().component(component).build()))
              .build());
    }
  }

  TestMateu mateu;
  CookieSecuredRemotes remotes;

  @BeforeEach
  void boot() {
    remotes = new CookieSecuredRemotes();
    mateu = TestMateu.withUisAndBeans(List.of(remotes), Shell.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  private AppDto viaUrl(String route, Map<String, String> headers) {
    var increment =
        mateu.run(
            RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build(),
            headers);
    for (var fragment : increment.fragments()) {
      var found = find(fragment.component());
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  private static AppDto find(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) {
        return app;
      }
      for (var child : cs.children()) {
        var found = find(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  @Test
  void aReloadedRemoteScreenIsMountedFromTheRemoteWhenTheUserIsSignedInWithACookie() {
    var app = viaUrl("/concerts/new", Map.of("cookie", SESSION));

    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl())
        .as("both apps hold /concerts: the first one declared mounts it")
        .isEqualTo("/_catalog");
    assertThat(app.homeRoute()).isEqualTo("/concerts/new");
  }

  @Test
  void theCookieGoesOnlyToRemotesBehindTheSameFrontDoor() {
    viaUrl("/concerts", Map.of("cookie", SESSION, "authorization", "Bearer t"));

    assertThat(remotes.calls).isNotEmpty();
    for (var call : remotes.calls) {
      assertThat(call.headers()).containsEntry("Authorization", "Bearer t");
      if (call.baseUrl().startsWith("https://partner.example")) {
        assertThat(call.headers()).doesNotContainKey("Cookie");
      } else {
        assertThat(call.headers()).containsEntry("Cookie", SESSION);
      }
    }
  }

  @Test
  void withoutTheCookieNoRemoteClaimsTheRouteAndItStaysOnTheShell() {
    var app = viaUrl("/concerts", Map.of());

    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isNullOrEmpty();
  }

  /**
   * The remote may build its menu for the user it was sent, so a descriptor fetched with one
   * caller's cookie is never answered to another caller.
   */
  @Test
  void aDescriptorFetchedWithOneCookieIsNotReusedForAnotherCaller() {
    assertThat(viaUrl("/concerts", Map.of("cookie", SESSION)).homeBaseUrl()).isEqualTo("/_catalog");

    assertThat(viaUrl("/concerts", Map.of("cookie", "MODUX_AUTH=someone-else")).homeBaseUrl())
        .isNullOrEmpty();
  }
}
