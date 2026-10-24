package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import io.mateu.core.infra.versioning.AppBuild;
import io.mateu.core.infra.versioning.RendererCompatibility;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * The version headers of Mateu's endpoints on WebFlux: every response carries the build id ({@link
 * AppBuild#HEADER}) — refusals and errors included — and the renderer a request names ({@link
 * RendererCompatibility#HEADER}) is checked against this server's wire major.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class MateuVersionHeadersWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    if (!CorsPolicy.appliesTo(request.getPath().value())) {
      return chain.filter(exchange);
    }
    RendererCompatibility.check(request.getHeaders().getFirst(RendererCompatibility.HEADER));
    var response = exchange.getResponse();
    // at commit time: the first request is the one that builds the wire type allow-list
    response.beforeCommit(
        () -> {
          var build = AppBuild.id();
          if (build != null) {
            response.getHeaders().set(AppBuild.HEADER, build);
          }
          return Mono.empty();
        });
    return chain.filter(exchange);
  }
}
