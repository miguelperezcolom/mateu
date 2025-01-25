package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Private;

public interface MateuSecurityManager {

  UserPrincipal getPrincipal(HttpRequest httpRequest);

  boolean check(Private annotation, HttpRequest httpRequest);
}
