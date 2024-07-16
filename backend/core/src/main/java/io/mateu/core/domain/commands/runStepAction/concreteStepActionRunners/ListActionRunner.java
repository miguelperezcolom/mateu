package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ListActionRunner {

  boolean applies(Crud crud, String actionId);

  Mono<Void> run(
      Crud crud,
      String journeyId,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
