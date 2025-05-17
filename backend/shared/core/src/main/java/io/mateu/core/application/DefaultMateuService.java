package io.mateu.core.application;

import io.mateu.core.application.getui.GetUIQuery;
import io.mateu.core.application.getui.GetUIUseCase;
import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.application.runaction.RunActionUseCase;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Named
@Singleton
@RequiredArgsConstructor
public class DefaultMateuService implements MateuService {

  private final GetUIUseCase getUIUseCase;
  private final RunActionUseCase runActionUseCase;

  @Override
  public Mono<UIDto> getUI(String uiId, String baseUrl, GetUIRqDto rq, HttpRequest httpRequest) {
    return getUIUseCase.handle(new GetUIQuery(uiId, baseUrl, httpRequest));
  }

  @Override
  public Mono<UIIncrementDto> runAction(
      String uiId,
      String route,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      HttpRequest httpRequest)
      throws Throwable {
    return runActionUseCase.handle(
        new RunActionCommand(
            baseUrl,
            uiId,
            route,
            actionId,
            rq.componentType(),
            rq.data(),
            rq.contextData(),
            httpRequest));
  }
}
