package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.UI;
import reactor.core.publisher.Mono;

public interface DynamicUI {
  Mono<UI> build();
}
