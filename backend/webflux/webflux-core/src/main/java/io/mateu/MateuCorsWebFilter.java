package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Applies the {@code mateu.cors.allowed-origins} allow-list ({@link CorsPolicy}) to Mateu's
 * endpoints on WebFlux. Off unless origins are listed: then a preflight from an allowed origin is
 * answered here (before Spring Security and the handler mappings) and actual responses carry the
 * CORS headers. A request from any other origin gets no CORS headers, so the browser refuses it.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MateuCorsWebFilter implements WebFilter {

  private final CorsPolicy policy;

  public MateuCorsWebFilter(
      @Value("${" + CorsPolicy.ALLOWED_ORIGINS_PROPERTY + ":}") String allowedOrigins,
      @Value("${" + CorsPolicy.ALLOW_CREDENTIALS_PROPERTY + ":false}") String allowCredentials) {
    this.policy = CorsPolicy.of(allowedOrigins, allowCredentials);
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    String origin = request.getHeaders().getOrigin();
    if (!policy.enabled() || origin == null || !CorsPolicy.appliesTo(request.getPath().value())) {
      return chain.filter(exchange);
    }
    var response = exchange.getResponse();
    String requestMethod = request.getHeaders().getFirst("Access-Control-Request-Method");
    if (CorsPolicy.isPreflight(request.getMethod().name(), origin, requestMethod)) {
      var headers =
          policy.preflightHeaders(
              origin,
              requestMethod,
              request.getHeaders().getFirst("Access-Control-Request-Headers"));
      if (headers == null) {
        response.setStatusCode(HttpStatus.FORBIDDEN);
        return response.setComplete();
      }
      headers.forEach(response.getHeaders()::set);
      response.setStatusCode(HttpStatus.OK);
      return response.setComplete();
    }
    policy.responseHeaders(origin).forEach(response.getHeaders()::set);
    return chain.filter(exchange);
  }
}
