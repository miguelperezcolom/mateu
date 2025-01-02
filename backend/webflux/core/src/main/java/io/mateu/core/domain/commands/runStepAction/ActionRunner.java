package io.mateu.core.domain.commands.runStepAction;

import io.mateu.dtos.UIIncrementDto;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ActionRunner {

  boolean applies(Object viewInstance, String actionId, Map<String, Object> contextData);

  Mono<UIIncrementDto> run(
      Object viewInstance,
      String stepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
