package io.mateu.core.domain.commands.runStepAction;

import io.mateu.dtos.UIIncrement;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ActionRunner {

  boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData);

  Mono<UIIncrement> run(
      Object viewInstance,
      String stepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
