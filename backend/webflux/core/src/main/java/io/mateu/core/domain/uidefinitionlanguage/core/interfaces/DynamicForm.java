package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import io.mateu.dtos.Form;
import reactor.core.publisher.Mono;

public interface DynamicForm {
  Mono<Form> build();
}
