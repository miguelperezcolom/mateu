package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface HasInitMethod {

  void init(ServerHttpRequest serverHttpRequest);
}
