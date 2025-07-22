package io.mateu.core.domain.commands.runStepAction;

import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface HandlesActions {

  Mono<?> handle(
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
