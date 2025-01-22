package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Private;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface MateuSecurityManager {

  UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest);

  boolean check(Private annotation, ServerHttpRequest serverHttpRequest);
}
