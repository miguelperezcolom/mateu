package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import io.mateu.dtos.Crud;
import reactor.core.publisher.Mono;

public interface DynamicCrud {
  Mono<Crud> build();
}
