package io.mateu.uidl.interfaces;

import io.mateu.dtos.UIDto;
import reactor.core.publisher.Mono;

public interface DynamicUI {
  Mono<UIDto> build();
}
