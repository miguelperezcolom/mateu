package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.remote.dtos.Step;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ResultActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof Result;
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Step step = store.readStep(journeyId, actionId);
    store.getJourney(journeyId).setCurrentStepId(step.getId());
    store.getJourney(journeyId).setCurrentStepDefinitionId(step.getType());
    return Mono.empty();
  }
}
