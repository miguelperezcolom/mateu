package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.FormDto;
import reactor.core.publisher.Mono;

public interface DynamicForm {
  Mono<FormDto> build();
}
