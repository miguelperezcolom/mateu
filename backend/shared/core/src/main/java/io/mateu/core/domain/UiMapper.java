package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import reactor.core.publisher.Mono;

public interface UiMapper {

  boolean supports(Object instance);

  default int priority() {
    return Integer.MAX_VALUE;
  }

  Mono<UIDto> map(
      Object instance, String baseUrl, Map<String, Object> appState, HttpRequest httpRequest);
}
