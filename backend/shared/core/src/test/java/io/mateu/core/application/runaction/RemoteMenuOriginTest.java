package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RemoteMenu;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.junit.jupiter.api.Test;

/**
 * A relative remote menu is asked at {@code <Origin><baseUrl>}, and the Origin header is whatever a
 * non-browser client says it is. It must be an origin — nothing that steers the server-side request
 * to another path — and what one origin answered must not be served to a caller of another one.
 */
class RemoteMenuOriginTest {

  private static FakeHttpRequest requestFrom(String origin) {
    return new FakeHttpRequest(RunActionRqDto.builder().initiatorComponentId("c").build()) {
      @Override
      public String getHeaderValue(String key) {
        return "origin".equalsIgnoreCase(key) ? origin : null;
      }
    };
  }

  @Test
  void onlyABareHttpOriginIsAccepted() {
    assertThat(RemoteMenuHandler.isOrigin("https://shop.acme.com")).isTrue();
    assertThat(RemoteMenuHandler.isOrigin("http://localhost:8080")).isTrue();
    assertThat(RemoteMenuHandler.isOrigin("http://internal:8080/admin?")).isFalse();
    assertThat(RemoteMenuHandler.isOrigin("http://internal/x#")).isFalse();
    assertThat(RemoteMenuHandler.isOrigin("http://user:pw@internal")).isFalse();
    assertThat(RemoteMenuHandler.isOrigin("file:///etc")).isFalse();
    assertThat(RemoteMenuHandler.isOrigin("null")).isFalse();
  }

  @Test
  void aRelativeRemoteIsResolvedOnlyAgainstAValidOrigin() {
    var menu = new RemoteMenu("/_forms");
    assertThat(RemoteMenuHandler.absoluteBaseUrl(menu, requestFrom("https://shop.acme.com")))
        .isEqualTo("https://shop.acme.com/_forms");
    assertThat(RemoteMenuHandler.absoluteBaseUrl(menu, requestFrom("http://10.0.0.1/x?"))).isNull();
    assertThat(
            RemoteMenuHandler.absoluteBaseUrl(
                new RemoteMenu("https://forms.acme.com"), requestFrom("http://evil")))
        .isEqualTo("https://forms.acme.com");
  }

  @Test
  void whatOneOriginAnsweredIsNotServedToAnother() {
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
            var route = baseUrl.startsWith("http://evil") ? "/hijacked" : "/tasks";
            var app =
                AppDto.builder()
                    .route("")
                    .homeRoute("_no_home_route")
                    .homeConsumedRoute("")
                    .menu(List.of(MenuOptionDto.builder().label("x").route(route).build()))
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

    // an anonymous caller primes the cache from a host of its choosing...
    assertThat(handler.claim(menu, "/hijacked", requestFrom("http://evil:9999"), null).block())
        .isPositive();
    // ...and a real browser on the real origin does not get that answer
    assertThat(handler.cachedClaim(menu, "/hijacked", requestFrom("https://shop.acme.com")))
        .isEqualTo(RemoteMenuHandler.NOT_KNOWN);
    assertThat(handler.claim(menu, "/tasks", requestFrom("https://shop.acme.com"), null).block())
        .isPositive();
    assertThat(calls).containsExactly("http://evil:9999/_forms", "https://shop.acme.com/_forms");

    // a non-origin Origin is never asked at all
    assertThat(
            handler.claim(menu, "/tasks", requestFrom("http://10.0.0.1:8080/admin?"), null).block())
        .isEqualTo(-1);
    assertThat(calls).hasSize(2);
  }
}
