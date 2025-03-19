package io.mateu.core.application;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.ItemsDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.Map;
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

  Mono<UIIncrementDto> runStepAndReturn(
      String uiId,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String componentId,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;

  Mono<PageDto> getListRows(
      String componentType,
      int page,
      int page_size,
      Map<String, Object> data,
      String searchText,
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;

  Mono<ItemsDto> getItems(String itemProviderId, int page, int page_size, String search_text)
      throws Throwable;
}
