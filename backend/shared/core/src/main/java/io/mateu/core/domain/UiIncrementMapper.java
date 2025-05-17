package io.mateu.core.domain;

import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface UiIncrementMapper {

  boolean supports(Object instance);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Mono<UIIncrementDto> map(
      Object instance, String baseUrl, String initiatorComponentId, HttpRequest httpRequest);
}
