package io.mateu;

import io.mateu.core.infra.ClientErrorLog;
import java.io.ByteArrayOutputStream;
import java.security.Principal;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * {@code POST <baseUrl>/mateu/v3/client-log} on WebFlux: the errors the renderer hit or showed,
 * written to the log by {@link ClientErrorLog}. A filter for the same reason as the Spring MVC one
 * (the endpoint lives under every UI's base URL); ordered after Spring Security's chain (-100).
 */
@Component
@Order(0)
public class MateuClientLogWebFilter implements WebFilter {

  private final boolean enabled;

  public MateuClientLogWebFilter(
      @Value("${" + ClientErrorLog.ENABLED_PROPERTY + ":true}") boolean enabled) {
    this.enabled = enabled;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    if (!HttpMethod.POST.equals(request.getMethod())
        || !ClientErrorLog.isEndpoint(request.getPath().value())) {
      return chain.filter(exchange);
    }
    var response = exchange.getResponse();
    if (!enabled) {
      response.setStatusCode(HttpStatus.NOT_FOUND);
      return response.setComplete();
    }
    if (ClientErrorLog.tooLarge(request.getHeaders().getContentLength())) {
      response.setStatusCode(HttpStatus.PAYLOAD_TOO_LARGE);
      return response.setComplete();
    }
    Mono<byte[]> body =
        request
            .getBody()
            .reduceWith(
                ByteArrayOutputStream::new,
                (out, buffer) -> {
                  try {
                    int room = ClientErrorLog.MAX_BODY_BYTES + 1 - out.size();
                    if (room > 0) {
                      byte[] bytes = new byte[Math.min(room, buffer.readableByteCount())];
                      buffer.read(bytes);
                      out.writeBytes(bytes);
                    }
                    return out;
                  } finally {
                    DataBufferUtils.release(buffer);
                  }
                })
            .map(ByteArrayOutputStream::toByteArray)
            .defaultIfEmpty(new byte[0]);
    Mono<Optional<String>> user =
        exchange
            .getPrincipal()
            .map(Principal::getName)
            .map(Optional::of)
            .defaultIfEmpty(Optional.empty());
    return Mono.zip(body, user)
        .map(t -> ClientErrorLog.handle(t.getT1(), t.getT2().orElse(null)))
        .onErrorReturn(ClientErrorLog.BAD_REQUEST)
        .flatMap(
            status -> {
              response.setStatusCode(HttpStatus.valueOf(status));
              return response.setComplete();
            });
  }
}
