package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.persistence.Merger;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Step;
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

  final JourneyStoreService store;
  final ReflectionHelper reflectionHelper;
  final ValidationService validationService;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId);
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

    validationService.validate(viewInstance);

    reflectionHelper.newInstance(Merger.class).merge(viewInstance);

    Step initialStep = store.getInitialStep(journeyId);

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            List.of(),
            new Destination(
                DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()),
            null);
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);

    return Mono.empty();
  }
}
