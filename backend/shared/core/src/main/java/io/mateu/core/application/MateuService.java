package io.mateu.core.application;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface MateuService {

  Mono<UIDto> getUI(String uiId, String baseUrl, GetUIRqDto rq, HttpRequest httpRequest);

  Mono<UIIncrementDto> runAction(
      String uiId,
      String route,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      HttpRequest httpRequest)
      throws Throwable;
}
