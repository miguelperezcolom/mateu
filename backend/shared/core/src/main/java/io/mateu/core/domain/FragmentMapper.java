package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;

public interface FragmentMapper {

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Object mapToFragment(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest);
}
