package io.mateu.core.application.getui;

import io.mateu.core.domain.InstanceFactoryProvider;
import io.mateu.core.domain.UiMapperProvider;
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

  private final InstanceFactoryProvider instanceFactoryProvider;
  private final UiMapperProvider uiMapperProvider;

  public Mono<UIDto> handle(GetUIQuery query) {
    log.info("get ui for {}", query);
    var instanceFactory = instanceFactoryProvider.get(query.uiId());
    return Mono.just(query)
        .flatMap(rq -> instanceFactory.createInstance(rq.uiId(), Map.of(), rq.httpRequest()))
        .flatMap(
            ui ->
                uiMapperProvider
                    .get(ui)
                    .map(ui, query.baseUrl(), query.route(), query.config(), query.httpRequest()));
  }
}
