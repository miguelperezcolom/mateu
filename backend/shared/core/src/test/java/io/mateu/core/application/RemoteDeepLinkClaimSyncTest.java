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
import io.mateu.uidl.interfaces.Submenu;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A deep link (a reloaded or bookmarked URL) that no local menu entry claims is mounted from the
 * remote that owns it, chosen by the LONGEST claim — whatever group the remotes are nested in, and
 * without failing when one of them is down.
 */
class RemoteDeepLinkClaimSyncTest {

  @SuppressWarnings("unused")
  public static class Admin implements Submenu {
    @Menu RemoteMenu sales = new RemoteMenu("/_sales").withLabel("Sales").withPath("/sales");

    @Menu
    RemoteMenu billing = new RemoteMenu("/_billing").withLabel("Billing").withPath("/billing");

    @Menu RemoteMenu down = new RemoteMenu("/_down").withLabel("Down").withPath("/down");
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Hub")
  public static class Hub {
    @Menu String home = "/local";

    @Menu Admin admin;
  }

  /** Remotes answering with their menus; one of them is down. */
  public static class FakeRemotes implements MateuHttpClient {
    final Map<String, AtomicInteger> calls = new ConcurrentHashMap<>();

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return send(baseUrl, request, null);
    }

    @Override
    public CompletableFuture<UIIncrementDto> send(
        String baseUrl, RunActionRqDto request, String authorization) {
      calls.computeIfAbsent(baseUrl, k -> new AtomicInteger()).incrementAndGet();
      if (baseUrl.contains("_down")) {
        return CompletableFuture.failedFuture(new java.io.IOException("connection refused"));
      }
      var routes =
          baseUrl.contains("_sales")
              ? List.of("/orders")
              : List.of("/orders/invoices", "/payments");
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
  FakeRemotes remotes;

  @BeforeEach
  void boot() {
    remotes = new FakeRemotes();
    mateu = TestMateu.withUisAndBeans(List.of(remotes), Hub.class);
  }

  @AfterEach
  void shutdown() {
    mateu.close();
  }

  private static AppDto appOf(UIIncrementDto increment) {
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

  private UIIncrementDto viaUrl(String route) {
    return mateu.run(
        RunActionRqDto.builder().route(route).consumedRoute("_empty").actionId("").build());
  }

  @Test
  void theRemoteWithTheLongestClaimMountsTheDeepLinkEvenWithAnotherOneDown() {
    var app = appOf(viaUrl("/orders/invoices/7"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_billing");
    assertThat(app.homeRoute()).isEqualTo("/orders/invoices/7");
  }

  @Test
  void aShorterClaimWinsWhenItIsTheOnlyOne() {
    var app = appOf(viaUrl("/orders/5"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_sales");
  }

  @Test
  void aDeepLinkUnderARemotesMountPrefixAsksOnlyThatRemote() {
    var app = appOf(viaUrl("/billing/payments"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isEqualTo("/_billing");
    assertThat(app.homeRoute()).as("the mount prefix is stripped").isEqualTo("/payments");
    assertThat(remotes.calls.keySet())
        .as("the remote owning the prefix is the only one asked")
        .allMatch(baseUrl -> baseUrl.contains("_billing"));
  }

  @Test
  void aRouteNoRemoteClaimsStaysOnTheShell() {
    var app = appOf(viaUrl("/nobody/claims/this"));
    assertThat(app).isNotNull();
    assertThat(app.homeBaseUrl()).isNullOrEmpty();
    assertThat(app.homeRoute()).isEqualTo("/nobody/claims/this");
  }
}
