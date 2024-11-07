package io.mateu.core.infra;

import io.mateu.uidl.core.annotations.Private;
import io.mateu.uidl.core.interfaces.MateuSecurityManager;
import io.mateu.uidl.core.interfaces.UserPrincipal;
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
