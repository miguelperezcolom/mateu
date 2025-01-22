package io.mateu.core.application.getui;

import io.mateu.dtos.UIDto;
import reactor.core.publisher.Mono;

public class GetUIUseCase {

  public Mono<UIDto> handle(GetUIRequest request) {
    return Mono.empty();
  }
}
