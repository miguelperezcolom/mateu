package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import io.micronaut.context.annotation.Value;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.core.order.Ordered;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ResponseFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.ServerFilterPhase;

/**
 * Applies the {@code mateu.cors.allowed-origins} allow-list ({@link CorsPolicy}) to Mateu's
 * endpoints on Micronaut — the same policy as every other adapter, instead of Micronaut's own
 * {@code micronaut.server.cors.*} (which the generated controllers' {@code @CrossOrigin} used to
 * open to any origin, with credentials). Off unless origins are listed.
 */
@ServerFilter(ServerFilter.MATCH_ALL_PATTERN)
public class MateuCorsServerFilter implements Ordered {

  private final CorsPolicy policy;

  public MateuCorsServerFilter(
      @Value("${" + CorsPolicy.ALLOWED_ORIGINS_PROPERTY + ":}") String allowedOrigins,
      @Value("${" + CorsPolicy.ALLOW_CREDENTIALS_PROPERTY + ":false}") String allowCredentials) {
    this.policy = CorsPolicy.of(allowedOrigins, allowCredentials);
  }

  @Override
  public int getOrder() {
    // before security, like Micronaut's own CORS filter
    return ServerFilterPhase.FIRST.before();
  }

  @RequestFilter
  @Nullable
  public HttpResponse<?> preflight(HttpRequest<?> request) {
    String origin = request.getHeaders().getOrigin().orElse(null);
    String requestMethod = request.getHeaders().get("Access-Control-Request-Method");
    if (!policy.enabled()
        || !CorsPolicy.appliesTo(request.getPath())
        || !CorsPolicy.isPreflight(request.getMethodName(), origin, requestMethod)) {
      return null;
    }
    var headers =
        policy.preflightHeaders(
            origin, requestMethod, request.getHeaders().get("Access-Control-Request-Headers"));
    if (headers == null) {
      return HttpResponse.status(HttpStatus.FORBIDDEN);
    }
    MutableHttpResponse<?> response = HttpResponse.ok();
    headers.forEach(response::header);
    return response;
  }

  @ResponseFilter
  public void headers(HttpRequest<?> request, MutableHttpResponse<?> response) {
    String origin = request.getHeaders().getOrigin().orElse(null);
    if (!policy.enabled()
        || origin == null
        || !CorsPolicy.appliesTo(request.getPath())
        || response.getHeaders().contains("Access-Control-Allow-Origin")) {
      return;
    }
    policy.responseHeaders(origin).forEach(response::header);
  }
}
