package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.annotations.Private;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface MateuSecurityManager {

  UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest);

  boolean check(Private annotation, ServerHttpRequest serverHttpRequest);
}
