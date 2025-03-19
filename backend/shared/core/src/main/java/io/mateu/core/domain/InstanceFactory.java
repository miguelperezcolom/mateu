package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface InstanceFactory {

  Mono<? extends Object> createInstance(
      String className, Map<String, Object> data, HttpRequest httpRequest);
}
