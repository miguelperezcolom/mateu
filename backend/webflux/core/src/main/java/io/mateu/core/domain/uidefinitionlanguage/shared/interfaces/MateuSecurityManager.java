package io.mateu.core.domain.uidefinitionlanguage.shared.interfaces;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Private;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface MateuSecurityManager {

  UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest);

  boolean check(Private annotation, ServerHttpRequest serverHttpRequest);
}
