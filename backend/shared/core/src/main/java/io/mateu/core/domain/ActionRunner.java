package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface ActionRunner {

  boolean supports(Object instance, String actionId, HttpRequest httpRequest);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Mono<?> run(Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest);
}
