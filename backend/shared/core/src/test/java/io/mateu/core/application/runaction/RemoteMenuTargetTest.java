package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.infra.out.RemoteTargets;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RemoteMenu;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Where a federated remote menu is asked. A relative {@code baseUrl} used to be resolved against
 * the request's {@code Origin} header — whatever a non-browser client says it is, so the server
 * could be steered to POST to an internal host (SSRF). Now it resolves against THIS server's base
 * url ({@code mateu.self-base-url}, else the adapter's local socket), the request has no say, and
 * an optional allow-list bounds the hosts a remote may live on.
 */
class RemoteMenuTargetTest {

  @AfterEach
  void clearSettings() {
    System.clearProperty(RemoteTargets.SELF_BASE_URL);
    System.clearProperty(RemoteTargets.ALLOWED_HOSTS);
  }

  /** A request whose Origin the attacker chose, from an adapter that knows (or not) its socket. */
  private static FakeHttpRequest requestFrom(String origin, String selfBaseUrl) {
    return new FakeHttpRequest(RunActionRqDto.builder().initiatorComponentId("c").build()) {
      @Override
      public String getHeaderValue(String key) {
        return "origin".equalsIgnoreCase(key) ? origin : null;
      }

      @Override
      public String getSelfBaseUrl() {
        return selfBaseUrl;
      }
    };
  }

  @Test
  void theOriginHeaderNoLongerDecidesWhereARelativeRemoteIsAsked() {
    var menu = new RemoteMenu("/_forms");
    assertThat(
            RemoteMenuHandler.absoluteBaseUrl(
                menu, requestFrom("http://169.254.169.254", "http://localhost:8080")))
        .isEqualTo("http://localhost:8080/_forms");
    // nothing known about ourselves: not asked anywhere, rather than asked where the client said
    assertThat(RemoteMenuHandler.absoluteBaseUrl(menu, requestFrom("http://evil", null))).isNull();
  }

  @Test
  void theConfiguredSelfBaseUrlWinsOverTheSocket() {
    System.setProperty(RemoteTargets.SELF_BASE_URL, "https://shell.acme.com/");
    assertThat(
            RemoteMenuHandler.absoluteBaseUrl(
                new RemoteMenu("/_forms"), requestFrom("http://evil", "http://localhost:8080")))
        .isEqualTo("https://shell.acme.com/_forms");
    // an absolute remote is declared configuration and is asked where it says
    assertThat(
            RemoteMenuHandler.absoluteBaseUrl(
                new RemoteMenu("https://forms.acme.com"), requestFrom("http://evil", null)))
        .isEqualTo("https://forms.acme.com");
  }

  @Test
  void aSelfBaseUrlThatIsNotAnOriginIsIgnored() {
    System.setProperty(RemoteTargets.SELF_BASE_URL, "http://user:pw@internal/x?");
    assertThat(
            RemoteMenuHandler.absoluteBaseUrl(new RemoteMenu("/_forms"), requestFrom(null, null)))
        .isNull();
    assertThat(RemoteMenuHandler.isOrigin("https://shop.acme.com")).isTrue();
    assertThat(RemoteMenuHandler.isOrigin("file:///etc")).isFalse();
  }

  @Test
  void theAllowListBoundsTheHostsARemoteMayLiveOn() {
    System.setProperty(RemoteTargets.ALLOWED_HOSTS, "forms.acme.com, orders.internal:8080");
    RemoteTargets.check(URI.create("https://forms.acme.com/_forms"));
    RemoteTargets.check(URI.create("http://orders.internal:8080/x"));
    assertThatThrownBy(() -> RemoteTargets.check(URI.create("http://orders.internal:9090/x")))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> RemoteTargets.check(URI.create("http://169.254.169.254/latest")))
        .isInstanceOf(IllegalArgumentException.class);
    System.clearProperty(RemoteTargets.ALLOWED_HOSTS);
    // without a list any http(s) host is fine — but never another scheme or user info
    RemoteTargets.check(URI.create("http://anything:1/x"));
    assertThatThrownBy(() -> RemoteTargets.check(URI.create("file:///etc/passwd")))
        .isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> RemoteTargets.check(URI.create("http://u:p@host/x")))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void callersOnDifferentOriginsShareOneTargetAndOneCacheEntry() {
    var calls = new ArrayList<String>();
    MateuHttpClient client =
        new MateuHttpClient() {
          @Override
          public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto rq) {
            return send(baseUrl, rq, null);
          }

          @Override
          public CompletableFuture<UIIncrementDto> send(
              String baseUrl, RunActionRqDto rq, String authorization) {
            calls.add(baseUrl);
            var app =
                AppDto.builder()
                    .route("")
                    .homeRoute("_no_home_route")
                    .homeConsumedRoute("")
                    .menu(List.of(MenuOptionDto.builder().label("x").route("/tasks").build()))
                    .build();
            var component = new ClientSideComponentDto(app, "app", List.of(), null, null, null);
            return CompletableFuture.completedFuture(
                UIIncrementDto.builder()
                    .fragments(List.of(UIFragmentDto.builder().component(component).build()))
                    .build());
          }
        };
    var handler = new RemoteMenuHandler(client, new RemoteAppDescriptorCache(() -> 0L, 60_000));
    var menu = new RemoteMenu("/_forms");

    assertThat(
            handler
                .claim(
                    menu, "/tasks", requestFrom("http://evil:9999", "http://localhost:8080"), null)
                .block())
        .isPositive();
    assertThat(
            handler
                .claim(
                    menu,
                    "/tasks",
                    requestFrom("https://shop.acme.com", "http://localhost:8080"),
                    null)
                .block())
        .isPositive();
    assertThat(calls).containsExactly("http://localhost:8080/_forms");
  }
}
