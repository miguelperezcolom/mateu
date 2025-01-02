package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.CrudDto;
import reactor.core.publisher.Mono;

public interface DynamicCrud {
  Mono<CrudDto> build();
}
