package io.mateu.core.domain.uidefinition.core.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface HasInitMethod {

  void init(ServerHttpRequest serverHttpRequest);
}
