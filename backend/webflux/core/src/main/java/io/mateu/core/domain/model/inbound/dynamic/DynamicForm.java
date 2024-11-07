package io.mateu.core.domain.model.inbound.dynamic;

import io.mateu.dtos.Form;
import reactor.core.publisher.Mono;

public interface DynamicForm {
  Mono<Form> build();
}
