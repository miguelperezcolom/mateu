package io.mateu.core.infra;

import io.mateu.uidl.annotations.Private;
import io.mateu.uidl.interfaces.MateuSecurityManager;
import io.mateu.uidl.interfaces.UserPrincipal;
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
