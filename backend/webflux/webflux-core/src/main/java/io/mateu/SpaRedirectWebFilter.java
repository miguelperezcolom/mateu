package io.mateu;

import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.SpaFallback;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.resource.ResourceWebHandler;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The SPA fallback on WebFlux ({@link SpaFallback}) — the port of Spring MVC's {@code
 * SpaRedirectFilter}: a GET with no handler of its own (a deep link deeper than the generated index
 * routes reach, or a deep link of a YAML-defined root mount) is answered with the index of the UI
 * that owns it, by rewriting the request path.
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 10)
public class SpaRedirectWebFilter implements WebFilter {

  private final ObjectProvider<HandlerMapping> handlerMappings;

  public SpaRedirectWebFilter(ObjectProvider<HandlerMapping> handlerMappings) {
    this.handlerMappings = handlerMappings;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    String path = request.getPath().pathWithinApplication().value();
    if (!HttpMethod.GET.equals(request.getMethod()) || !SpaFallback.candidate(path)) {
      return chain.filter(exchange);
    }
    var baseUrls = baseUrls();
    if (SpaFallback.isIndex(path, baseUrls)) {
      return chain.filter(exchange);
    }
    return hasHandler(exchange)
        .flatMap(
            handled -> {
              String target = handled ? null : SpaFallback.target(path, baseUrls);
              if (target == null) {
                return chain.filter(exchange);
              }
              var forwarded = exchange.mutate().request(builder -> builder.path(target)).build();
              return chain.filter(forwarded);
            });
  }

  private Mono<Boolean> hasHandler(ServerWebExchange exchange) {
    return Flux.fromStream(handlerMappings.orderedStream())
        .concatMap(mapping -> mapping.getHandler(exchange))
        .filter(handler -> !(handler instanceof ResourceWebHandler))
        .hasElements()
        .onErrorReturn(false);
  }

  private List<String> baseUrls() {
    var baseUrls = new ArrayList<String>();
    for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
      baseUrls.add(controller.getBaseUrl());
    }
    return baseUrls;
  }
}
