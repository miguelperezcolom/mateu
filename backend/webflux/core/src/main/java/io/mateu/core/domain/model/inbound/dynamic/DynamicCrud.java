package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.Crud;
import reactor.core.publisher.Mono;

public interface DynamicCrud {
  Mono<Crud> build();
}
