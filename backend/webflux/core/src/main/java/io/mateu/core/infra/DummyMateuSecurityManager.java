package io.mateu.core.infra;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Private;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.MateuSecurityManager;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.UserPrincipal;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class DummyMateuSecurityManager implements MateuSecurityManager {
  @Override
  public UserPrincipal getPrincipal(ServerHttpRequest serverHttpRequest) {
    return null;
  }

  @Override
  public boolean check(Private annotation, ServerHttpRequest serverHttpRequest) {
    return true;
  }
}
