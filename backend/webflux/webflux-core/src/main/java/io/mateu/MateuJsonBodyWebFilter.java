package io.mateu;

import io.mateu.core.infra.security.JsonBodyGuard;
import java.nio.charset.StandardCharsets;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Answers 415 to a POST to Mateu's action endpoints whose body is not declared JSON ({@link
 * JsonBodyGuard}): the CORS-simple requests a cross-site page could forge with the user's cookies.
 * Right after the CORS filter, ahead of Spring Security and the handler mappings.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class MateuJsonBodyWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    if (!JsonBodyGuard.refuses(
        request.getMethod().name(),
        request.getPath().value(),
        request.getHeaders().getFirst("Content-Type"))) {
      return chain.filter(exchange);
    }
    var response = exchange.getResponse();
    response.setStatusCode(HttpStatusCode.valueOf(JsonBodyGuard.UNSUPPORTED_MEDIA_TYPE));
    response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
    var buffer =
        response.bufferFactory().wrap(JsonBodyGuard.MESSAGE.getBytes(StandardCharsets.UTF_8));
    return response.writeWith(Mono.just(buffer));
  }
}
