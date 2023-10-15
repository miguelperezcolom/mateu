package io.mateu.mdd.core.interfaces;

import io.mateu.remote.dtos.Form;
import reactor.core.publisher.Mono;

public interface DynamicForm {

    Mono<Form> build();

}
