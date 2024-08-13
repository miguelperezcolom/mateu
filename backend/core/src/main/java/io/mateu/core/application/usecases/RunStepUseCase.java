package io.mateu.core.application.usecases;

import io.mateu.core.domain.commands.runStepAction.RunStepActionCommand;
import io.mateu.core.domain.commands.runStepAction.RunStepActionCommandHandler;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.RunActionRq;
import io.mateu.dtos.StepWrapper;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
public class RunStepUseCase {

  private final RunStepActionCommandHandler runStepActionCommandHandler;
  private final Serializer serializer;

  public RunStepUseCase(
      RunStepActionCommandHandler runStepActionCommandHandler, Serializer serializer) {
    this.runStepActionCommandHandler = runStepActionCommandHandler;
    this.serializer = serializer;
  }

  public Mono<StepWrapper> runStep(
      String journeyTypeId,
      String journeyId,
      String stepId,
      String actionId,
      RunActionRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    log.info("running action " + journeyTypeId + "/" + journeyId + "/" + stepId + "/" + actionId);
    JourneyContainer journeyContainer =
        serializer.fromJson(serializer.toJson(rq.journey()), JourneyContainer.class);
    return runStepActionCommandHandler
        .handle(
            new RunStepActionCommand(
                journeyTypeId,
                journeyId,
                stepId,
                actionId,
                rq.data(),
                journeyContainer,
                serverHttpRequest))
        .map(
            c -> new StepWrapper(c.journey(), c.steps().get(c.journey().currentStepId()), toMap(c)))
        .subscribeOn(Schedulers.boundedElastic());
  }

  private Map<String, Object> toMap(Object o) {
    if (o instanceof Map) {
      return (Map<String, Object>) o;
    } else {
      try {
        return serializer.toMap(o);
      } catch (Exception e) {
        e.printStackTrace();
        return Map.of();
      }
    }
  }
}
