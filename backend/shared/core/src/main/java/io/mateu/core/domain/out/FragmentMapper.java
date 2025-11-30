package io.mateu.core.domain.out;

import io.mateu.uidl.interfaces.HttpRequest;

public interface FragmentMapper {

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Object mapToFragment(
      Object instance,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest);
}
