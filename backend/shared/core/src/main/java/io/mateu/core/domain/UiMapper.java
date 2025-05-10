package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface UiMapper {

  boolean supports(Object instance);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Mono<UIDto> map(Object instance, String baseUrl, HttpRequest httpRequest);
}
