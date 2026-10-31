package io.mateu.core.application.microfrontends;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerResolutionDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.CacheableFragment;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.remote.FragmentCachePolicySupplier;
import io.mateu.uidl.remote.RemoteCatalogSupplier;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.security.CallerIdentity;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.Test;

class MicroFrontendServerResolverTest {

  static final String BASE = "https://orders.acme.com/ui";

  /** A client whose calls never answer: what the resolver does with them is the point. */
  static class HangingClient implements MateuHttpClient {
    final List<CompletableFuture<UIIncrementDto>> calls = new CopyOnWriteArrayList<>();

    @Override
    public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto request) {
      return sendWithHeaders(baseUrl, request, Map.of());
    }

    @Override
    public CompletableFuture<UIIncrementDto> sendWithHeaders(
        String baseUrl, RunActionRqDto request, Map<String, String> headers) {
      var call = new CompletableFuture<UIIncrementDto>();
      calls.add(call);
      return call;
    }
  }

  static MicroFrontendServerResolver resolver(MateuHttpClient http) {
    RemoteCatalogSupplier supplier = () -> List.of(new RemoteDescriptor("orders", BASE, 100, null));
    return new MicroFrontendServerResolver(
        new DefaultRemoteRegistry(List.of(supplier), key -> null),
        http,
        new InMemoryFragmentCacheStore(),
        new RemoteIdentityStrategies(List.of()),
        new DefaultCorrelationIdProvider(),
        List.of(),
        MicroFrontendSettings.from(key -> null),
        request -> CallerIdentity.anonymous(),
        request -> null,
        WireMapper.shared());
  }

  static UIIncrementDto pageWith(String baseUrl) {
    var microFrontend =
        new MicroFrontendDto(
            baseUrl,
            "/x",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            new ServerResolutionDto(80, null, null, null, true));
    return UIIncrementDto.builder()
        .fragments(
            List.of(
                new UIFragmentDto(
                    "page",
                    new ClientSideComponentDto(microFrontend, "mfe", List.of(), null, null, null),
                    Map.of(),
                    Map.of(),
                    UIFragmentActionDto.Replace,
                    null)))
        .build();
  }

  @Test
  void theCallStillRunningAtTheDeadlineIsCancelled() {
    var http = new HangingClient();
    var resolved =
        resolver(http).resolve(pageWith(BASE + "/orders"), new FakeHttpRequest(null)).block();
    assertThat(http.calls).singleElement().satisfies(call -> assertThat(call).isCancelled());
    var microFrontend =
        (MicroFrontendDto)
            ((ClientSideComponentDto) resolved.fragments().get(0).component()).metadata();
    assertThat(microFrontend.resolved()).isNull();
    assertThat(microFrontend.baseUrl()).isEqualTo(BASE + "/orders");
  }

  @Test
  void aUrlThatOnlyLooksLikeARegisteredRemoteIsRefused() {
    var http = new HangingClient();
    for (var url :
        List.of(
            "https://orders.acme.com/uix",
            "https://orders.acme.com.evil.io/ui",
            "http://orders.acme.com/ui",
            "https://orders.acme.com:8443/ui",
            "https://orders.acme.com/ui/../admin",
            "https://user@orders.acme.com/ui")) {
      assertThatThrownBy(
              () -> resolver(http).resolve(pageWith(url), new FakeHttpRequest(null)).block())
          .as(url)
          .hasMessageContaining("is not under any registered remote");
    }
    assertThat(http.calls).isEmpty();
  }

  @Test
  void registryMatchesBySchemeHostPortAndPathSegment() {
    RemoteCatalogSupplier supplier =
        () ->
            List.of(
                new RemoteDescriptor("root", "https://a.com", null, null),
                new RemoteDescriptor("deep", "https://a.com/x", null, null),
                new RemoteDescriptor("hub", "/_content-hub", null, null),
                new RemoteDescriptor("bad", "ftp://a.com", null, null));
    var registry =
        new DefaultRemoteRegistry(
            List.of(supplier),
            key ->
                switch (key) {
                  case "mateu.remotes" -> "props";
                  case "mateu.remotes.props.base-url" -> "https://b.com/p";
                  case "mateu.remotes.props.timeout-ms" -> "250";
                  default -> null;
                });
    assertThat(registry.forUrl("https://a.com/x/y"))
        .get()
        .extracting(RemoteDescriptor::id)
        .isEqualTo("deep");
    assertThat(registry.forUrl("https://a.com/xy"))
        .get()
        .extracting(RemoteDescriptor::id)
        .isEqualTo("root");
    assertThat(registry.forUrl("https://A.com:443/x"))
        .get()
        .extracting(RemoteDescriptor::id)
        .isEqualTo("deep");
    assertThat(registry.forUrl("/_content-hub"))
        .get()
        .extracting(RemoteDescriptor::id)
        .isEqualTo("hub");
    assertThat(registry.forUrl("/_content-hubx")).isEmpty();
    assertThat(registry.forUrl("https://b.com/p/q"))
        .get()
        .extracting(RemoteDescriptor::timeoutMs)
        .isEqualTo(250);
    assertThat(registry.byId("bad")).as("not an http(s) url: not registered").isEmpty();
  }

  @CacheableFragment(maxAgeSeconds = 30, varyBy = "shared")
  static class AnnotatedView {}

  static class KeyedView implements FragmentCachePolicySupplier {
    @Override
    public FragmentCachePolicy fragmentCachePolicy(io.mateu.uidl.interfaces.HttpRequest request) {
      return FragmentCachePolicy.byKey("aud-A", 60);
    }
  }

  @Test
  void aRemoteViewDeclaresItsCachePolicyOnItsLoads() {
    var page = pageWith(BASE);
    var stamped =
        FragmentCachePolicies.stamp(page, "", new FakeHttpRequest(null), new AnnotatedView());
    assertThat(stamped.fragmentCache().maxAgeSeconds()).isEqualTo(30);
    assertThat(stamped.fragmentCache().varyBy()).isEqualTo("shared");
    // only a load: an action's answer is never embedded by a host
    assertThat(FragmentCachePolicies.stamp(page, "save", null, new AnnotatedView()).fragmentCache())
        .isNull();
    assertThat(FragmentCachePolicies.stamp(page, "", null, new Object()).fragmentCache()).isNull();
  }

  @Test
  void aRemoteAnswersNotModifiedWithoutTheFragmentsWhenTheHostHoldsTheKey() {
    var page = pageWith(BASE);
    var held = new FakeHttpRequest(null).withHeader("X-Mateu-Fragment-Keys", "aud-B, aud-A");
    var stamped = FragmentCachePolicies.stamp(page, "", held, new KeyedView());
    assertThat(stamped.fragmentCache().notModified()).isTrue();
    assertThat(stamped.fragments()).isEmpty();
    var fresh = FragmentCachePolicies.stamp(page, "", new FakeHttpRequest(null), new KeyedView());
    assertThat(fresh.fragmentCache().notModified()).isFalse();
    assertThat(fresh.fragmentCache().key()).isEqualTo("aud-A");
    assertThat(fresh.fragments()).hasSize(1);
  }

  @Test
  void theInMemoryStoreExpiresAndStaysBounded() {
    var now = new java.util.concurrent.atomic.AtomicLong(0);
    var clock =
        new Clock() {
          @Override
          public ZoneOffset getZone() {
            return ZoneOffset.UTC;
          }

          @Override
          public Clock withZone(java.time.ZoneId zone) {
            return this;
          }

          @Override
          public Instant instant() {
            return Instant.ofEpochMilli(now.get());
          }
        };
    var store = new InMemoryFragmentCacheStore(2, clock);
    store.put("a", "1", Duration.ofSeconds(10));
    assertThat(store.get("a")).isEqualTo("1");
    now.set(10_000);
    assertThat(store.get("a")).isNull();
    store.put("a", "1", Duration.ofSeconds(10));
    store.put("b", "2", Duration.ofSeconds(10));
    store.put("c", "3", Duration.ofSeconds(10));
    assertThat(store.get("a")).isNull();
    assertThat(store.get("c")).isEqualTo("3");
    store.put("z", "0", Duration.ZERO);
    assertThat(store.get("z")).isNull();
  }

  @Test
  void theIslandIdMatchesTheRenderers() {
    var microFrontend =
        new MicroFrontendDto("https://a.com/x", "/r", null, null, null, "T", null, null);
    assertThat(MicroFrontendIds.of(microFrontend)).isEqualTo("mfe_https___a_com_x__r__T");
  }

  @Test
  void correlationIdIsTheCallersWhenSaneAndStableForTheRequest() {
    var provider = new DefaultCorrelationIdProvider();
    var request = new FakeHttpRequest(null).withHeader("X-Mateu-Correlation-Id", "abc-1");
    assertThat(provider.correlationId(request)).isEqualTo("abc-1");
    var forged = new FakeHttpRequest(null).withHeader("X-Mateu-Correlation-Id", "a\r\nInjected: 1");
    var id = provider.correlationId(forged);
    assertThat(id).doesNotContain("\n").isEqualTo(provider.correlationId(forged));
    var traced =
        new FakeHttpRequest(null)
            .withHeader("traceparent", "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01");
    assertThat(provider.correlationId(traced)).isEqualTo("4bf92f3577b34da6a3ce929d0e0e4736");
  }

  @Test
  void aRouteHandlerKeepsTheCachePolicyItDeclares() {
    var request = new FakeHttpRequest(null);
    FragmentCachePolicies.rememberRouteOwner(request, new AnnotatedView());
    var stamped =
        FragmentCachePolicies.stamp(pageWith(BASE), "", request, "the screen it routed to");
    assertThat(stamped.fragmentCache().varyBy()).isEqualTo("shared");
  }
}
