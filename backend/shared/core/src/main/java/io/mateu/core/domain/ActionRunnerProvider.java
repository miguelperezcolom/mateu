package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;

public interface ActionRunnerProvider {

  ActionRunner get(
      Object instance,
      String actionId,
      String consumedRoute,
      String route,
      HttpRequest httpRequest);
}
