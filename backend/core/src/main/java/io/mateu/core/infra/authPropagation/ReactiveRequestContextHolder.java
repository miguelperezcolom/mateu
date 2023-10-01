package io.mateu.core.infra.authPropagation;

import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public class ReactiveRequestContextHolder {
  public static final Class<ServerHttpRequest> CONTEXT_KEY = ServerHttpRequest.class;

  public static Mono<ServerHttpRequest> getRequest() {
    return Mono.deferContextual(ctx -> Mono.just(ctx.get(CONTEXT_KEY)));
  }
}
