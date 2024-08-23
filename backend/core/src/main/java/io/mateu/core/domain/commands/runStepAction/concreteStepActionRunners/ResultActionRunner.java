package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ResultActionRunner implements ActionRunner {

  @Autowired JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof Result;
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String componentId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Step step = store.readStep(journeyContainer, actionId);
    var journey = journeyContainer.journey();
    journeyContainer =
        new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            new Journey(
                journey.type(), journey.status(), journey.statusMessage(), step.id(), step.type()),
            journeyContainer.steps(),
            journeyContainer.stepHistory(),
            journeyContainer.initialStep(),
            journeyContainer.modalMustBeClosed());
    return Mono.just(journeyContainer);
  }
}
