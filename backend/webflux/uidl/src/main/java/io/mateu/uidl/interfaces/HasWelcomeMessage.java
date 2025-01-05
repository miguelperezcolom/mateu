package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface HasWelcomeMessage {

  String getWelcomeMessage(ServerHttpRequest serverHttpRequest);
}
