package io.mateu.core.domain.ports;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface InstanceFactory {

  boolean supports(String className);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Mono<?> createInstance(String className, Map<String, Object> data, HttpRequest httpRequest);
}
