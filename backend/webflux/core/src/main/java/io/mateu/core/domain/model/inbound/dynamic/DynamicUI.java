package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.UIDto;
import reactor.core.publisher.Mono;

public interface DynamicUI {
  Mono<UIDto> build();
}
