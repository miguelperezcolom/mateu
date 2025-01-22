package io.mateu.uidl.interfaces;

import org.springframework.http.server.reactive.ServerHttpRequest;

public interface HasLogout {

  String getLogoutUrl(ServerHttpRequest serverHttpRequest);
}
