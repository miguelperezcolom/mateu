package io.mateu.core.application;

import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.ItemsDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.inject.Named;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

@Named
public class FakeMateuService implements MateuService {
  @Override
  public Mono<UIDto> getUI(
      String uiId, String baseUrl, GetUIRqDto rq, ServerHttpRequest serverHttpRequest) {
    return Mono.empty();
  }

  @Override
  public Mono<UIIncrementDto> createJourney(
      String uiId,
      String baseUrl,
      String journeyTypeId,
      String journeyId,
      JourneyCreationRqDto rq,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return Mono.empty();
  }

  @Override
  public Mono<UIIncrementDto> runStepAndReturn(
      String uiId,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String componentId,
      String actionId,
      RunActionRqDto rq,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return Mono.empty();
  }

  @Override
  public Mono<PageDto> getListRows(
      String componentType,
      int page,
      int page_size,
      Map<String, Object> data,
      String searchText,
      Map<String, Object> filters,
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return Mono.empty();
  }

  @Override
  public Mono<ItemsDto> getItems(String itemProviderId, int page, int page_size, String search_text)
      throws Throwable {
    return Mono.empty();
  }
}
