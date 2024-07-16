package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.remote.dtos.Step;
import reactor.core.publisher.Mono;

public interface DynamicStep {
  Mono<Step> build();
}
