package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface ActionHandler {

  Object handle(Object target, String actionId, ServerHttpRequest serverHttpRequest);
}
