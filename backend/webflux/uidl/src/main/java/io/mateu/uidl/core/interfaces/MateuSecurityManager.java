package io.mateu.uidl.core.interfaces;

import io.mateu.uidl.core.annotations.Private;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface MateuSecurityManager {

  UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest);

  boolean check(Private annotation, ServerHttpRequest serverHttpRequest);
}
