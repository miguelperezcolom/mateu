package io.mateu.core.application;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

@Named
@Singleton
@RequiredArgsConstructor
public class DefaultMateuService implements MateuService {

  private final RunActionUseCase runActionUseCase;

  @Override
  public Flux<UIIncrementDto> runAction(
      String uiId, RunActionRqDto rq, String baseUrl, HttpRequest httpRequest) throws Throwable {
    return runActionUseCase.handle(
        new RunActionCommand(
            baseUrl,
            uiId,
            rq.route(),
            rq.consumedRoute(),
            rq.actionId(),
            rq.componentState(),
            rq.appState(),
            rq.initiatorComponentId(),
            httpRequest,
            rq.serverSideType(),
            rq.appServerSideType()));
  }
}
