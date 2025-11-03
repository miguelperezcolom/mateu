package io.mateu.core.domain.act;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import reactor.core.publisher.Flux;

public interface ActionRunner {

  boolean supports(Object instance, String actionId, HttpRequest httpRequest);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Flux<?> run(Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest);
}
