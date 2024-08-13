package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ListActionRunner {

  boolean applies(JourneyContainer journeyContainer, Crud crud, String actionId);

  Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Crud crud,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
