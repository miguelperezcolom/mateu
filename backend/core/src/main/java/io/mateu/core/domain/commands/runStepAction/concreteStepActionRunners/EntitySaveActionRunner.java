package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import jakarta.persistence.Entity;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EntitySaveActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;
  final ValidationService validationService;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    validationService.validate(viewInstance);

    reflectionHelper.newInstance(Merger.class).merge(viewInstance);

    Step initialStep = store.getInitialStep(journeyContainer);

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            List.of(),
            new Destination(
                DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()),
            null);
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyContainer, newStepId, whatToShow, serverHttpRequest);

    return Mono.empty();
  }
}
