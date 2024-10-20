package io.mateu.core.application.usecases;

import io.mateu.core.domain.commands.runStepAction.RunStepActionCommand;
import io.mateu.core.domain.commands.runStepAction.RunStepActionCommandHandler;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.RunActionRq;
import io.mateu.dtos.UIIncrement;
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

  public Mono<UIIncrement> runStep(
      String uiId,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String componentId,
      String actionId,
      RunActionRq rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    log.info(
        "running action "
            + uiId
            + "/"
            + journeyTypeId
            + "/"
            + journeyId
            + "/"
            + stepId
            + "/"
            + componentId
            + "/"
            + actionId);
    return runStepActionCommandHandler
        .handle(
            new RunStepActionCommand(
                journeyTypeId,
                journeyId,
                stepId,
                componentId,
                actionId,
                rq.componentType(),
                rq.data(),
                rq.contextData(),
                serverHttpRequest))
        .subscribeOn(Schedulers.boundedElastic());
  }
}
