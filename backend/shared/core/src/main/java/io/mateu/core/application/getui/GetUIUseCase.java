package io.mateu.core.application.getui;

import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.UiMapper;
import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.HasInitMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import java.util.Map;

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
