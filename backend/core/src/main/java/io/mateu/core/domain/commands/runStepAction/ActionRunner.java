package io.mateu.core.domain.commands.runStepAction;

import io.mateu.core.domain.model.store.JourneyContainer;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ActionRunner {

  boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId);

  Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
