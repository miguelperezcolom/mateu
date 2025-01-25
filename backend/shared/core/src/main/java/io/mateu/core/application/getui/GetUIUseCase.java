package io.mateu.core.application.getui;

import io.mateu.dtos.UIDto;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class GetUIUseCase {

  public Mono<UIDto> handle(GetUIRequest request) {
    log.info("get ui for {}", request);
    return Mono.empty();
  }
}
