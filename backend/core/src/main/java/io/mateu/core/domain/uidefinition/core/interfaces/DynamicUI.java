package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.remote.dtos.UI;
import reactor.core.publisher.Mono;

public interface DynamicUI {
  Mono<UI> build();
}
