package io.mateu.core.application;

import io.mateu.core.domain.commands.runStepAction.RunStepActionCommand;
import io.mateu.core.domain.commands.runStepAction.RunStepActionCommandHandler;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.util.Serializer;
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
        serializer.fromJson(serializer.toJson(rq.getJourney()), JourneyContainer.class);
    return runStepActionCommandHandler
        .handle(
            RunStepActionCommand.builder()
                .journeyTypeId(journeyTypeId)
                .journeyId(journeyId)
                .stepId(stepId)
                .actionId(actionId)
                .data(rq.getData())
                .journeyContainer(journeyContainer)
                .serverHttpRequest(serverHttpRequest)
                .build())
        .thenReturn(
            StepWrapper.builder()
                .journey(journeyContainer.getJourney())
                .store(toMap(journeyContainer))
                .step(
                    journeyContainer
                        .getSteps()
                        .get(journeyContainer.getJourney().getCurrentStepId()))
                .build())
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
