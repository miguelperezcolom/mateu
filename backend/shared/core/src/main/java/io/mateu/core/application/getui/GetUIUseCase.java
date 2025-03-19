package io.mateu.core.application.getui;

import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.UiMapper;
import io.mateu.dtos.UIDto;
import jakarta.inject.Named;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@RequiredArgsConstructor
public class GetUIUseCase {

  private final InstanceFactory instanceFactory;
  private final UiMapper uiMapper;

  public Mono<UIDto> handle(GetUIQuery query) {
    log.info("get ui for {}", query);
    return Mono.just(query)
        .flatMap(rq -> instanceFactory.createInstance(rq.uiId(), Map.of(), rq.httpRequest()))
        .flatMap(ui -> uiMapper.map(ui, query.baseUrl(), query.httpRequest()));
  }
}
