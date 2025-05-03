package io.mateu.core.application;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface MateuService {

  Mono<UIDto> getUI(
      String uiId, String baseUrl, GetUIRqDto rq, ServerHttpRequest serverHttpRequest);

  Mono<UIIncrementDto> createJourney(
      String uiId,
      String baseUrl,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRqDto rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;

  Mono<UIIncrementDto> runAction(
      String componentId,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
