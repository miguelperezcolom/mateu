package io.mateu.core.application.usecases;

import io.mateu.core.domain.commands.runStepAction.RunStepActionCommand;
import io.mateu.core.domain.commands.runStepAction.RunStepActionCommandHandler;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
public class RunStepUseCase {

  private final RunStepActionCommandHandler runStepActionCommandHandler;
  private final SerializerService serializerService;

  public RunStepUseCase(
      RunStepActionCommandHandler runStepActionCommandHandler,
      SerializerService serializerService) {
    this.runStepActionCommandHandler = runStepActionCommandHandler;
    this.serializerService = serializerService;
  }

  public Mono<UIIncrementDto> runStep(
      String uiId,
      String baseUrl,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String componentId,
      String actionId,
      RunActionRqDto rq,
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
                baseUrl,
                journeyTypeId,
                journeyId,
                stepId,
                componentId,
                actionId,
                rq.componentType(),
                rq.data(),
                rq.contextData(),
                serverHttpRequest))
        .map(
            i ->
                new UIIncrementDto(
                    i.commands(),
                    i.messages(),
                    i.uiFragments().stream()
                        .map(
                            f ->
                                new UIFragmentDto(
                                    f.target(),
                                    f.targetId(),
                                    componentId,
                                    f.modalStyle(),
                                    f.modalTitle(),
                                    f.content(),
                                    f.components()))
                        .toList()))
        .subscribeOn(Schedulers.boundedElastic());
  }
}
