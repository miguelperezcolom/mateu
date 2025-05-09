package io.mateu.core.application;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface MateuService {

  Mono<UIDto> getUI(String uiId, String baseUrl, GetUIRqDto rq, HttpRequest httpRequest);

  Mono<UIIncrementDto> createJourney(
      String uiId,
      String baseUrl,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRqDto rq,
      HttpRequest httpRequest)
      throws Throwable;

  Mono<UIIncrementDto> runAction(
      String componentId,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      HttpRequest httpRequest)
      throws Throwable;
}
