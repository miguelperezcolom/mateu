package io.mateu;

import io.mateu.core.infra.documents.DocumentDownloads;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * {@code GET <baseUrl>/mateu/v3/documents/<token>} on WebFlux: a document an action produced,
 * served once by {@link DocumentDownloads}. Ordered before Spring Security's chain (-100) for the
 * same reason as the Spring MVC filter: the single-use token is the authorization. Producing a lazy
 * document may block, so it runs on the bounded-elastic scheduler.
 */
@Component
@Order(-101)
public class MateuDocumentWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    String path = request.getPath().value();
    if (!HttpMethod.GET.equals(request.getMethod()) || !DocumentDownloads.isEndpoint(path)) {
      return chain.filter(exchange);
    }
    var response = exchange.getResponse();
    return Mono.fromCallable(() -> DocumentDownloads.serve(path))
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(
            served -> {
              response.setStatusCode(HttpStatus.valueOf(served.status()));
              served.headers().forEach((k, v) -> response.getHeaders().set(k, v));
              if (served.body().length == 0) {
                return response.setComplete();
              }
              return response.writeWith(Mono.just(response.bufferFactory().wrap(served.body())));
            });
  }
}
