package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import io.mateu.dtos.UI;
import reactor.core.publisher.Mono;

public interface DynamicUI {
  Mono<UI> build();
}
