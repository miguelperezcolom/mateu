package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface ConsumesHash {

  Object consume(String hash, ServerHttpRequest serverHttpRequest);
}
