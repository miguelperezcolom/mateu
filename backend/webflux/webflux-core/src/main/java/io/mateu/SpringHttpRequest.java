package io.mateu;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;

public class SpringHttpRequest implements HttpRequest {

  private final ServerHttpRequest delegate;
  private final Map<String, Object> attributes = new HashMap<>();
  private java.security.Principal principal;

  public SpringHttpRequest(ServerHttpRequest delegate) {
    this.delegate = delegate;
  }

  /** A call that may throw, as {@code MateuService.runAction} declares. */
  @FunctionalInterface
  public interface Call<T> {
    Flux<T> run() throws Throwable;
  }

  /**
   * Runs {@code call} once the exchange's authenticated principal (Spring Security, when present)
   * is known and attached to {@code request} — reactively, because WebFlux exposes the principal as
   * a {@code Mono} and blocking on it in an event-loop thread is not allowed.
   */
  public static <T> Flux<T> withPrincipalOf(
      ServerWebExchange exchange, SpringHttpRequest request, Call<T> call) {
    return exchange
        .getPrincipal()
        .map(Optional::<java.security.Principal>of)
        .defaultIfEmpty(Optional.empty())
        .flatMapMany(
            principal -> {
              request.principal = principal.orElse(null);
              try {
                return call.run();
              } catch (Throwable t) {
                return Flux.error(t);
              }
            });
  }

  /** Attaches the principal the framework authenticated (null = nobody). */
  public SpringHttpRequest withPrincipal(java.security.Principal principal) {
    this.principal = principal;
    return this;
  }

  @Override
  public java.security.Principal getUserPrincipal() {
    return principal;
  }

  @Override
  public String getParameterValue(String name) {
    return delegate.getQueryParams().getFirst(name);
  }

  @Override
  public List<String> getParameterValues(String name) {
    // absent → empty list, not null (same contract as the other adapters)
    var values = delegate.getQueryParams().get(name);
    return values != null ? values : List.of();
  }

  @Override
  public Object getAttribute(String key) {
    return attributes.get(key);
  }

  @Override
  public void setAttribute(String key, Object value) {
    attributes.put(key, value);
  }

  @Override
  public String getHeaderValue(String key) {
    return delegate.getHeaders().getFirst(key);
  }

  @Override
  public List<String> getHeaderValues(String key) {
    var values = delegate.getHeaders().get(key);
    return values != null ? values : List.of();
  }

  @Override
  public String getSelfBaseUrl() {
    // the LOCAL socket this request arrived on — not the Host header, which the client sets
    var local = delegate.getLocalAddress();
    if (delegate.getSslInfo() != null || local == null || local.getPort() <= 0) {
      return null;
    }
    return "http://localhost:" + local.getPort();
  }

  @Override
  public String path() {
    return delegate.getPath().value();
  }

  @Override
  public List<String> getParameterNames() {
    return delegate.getQueryParams().keySet().stream().toList();
  }
}
