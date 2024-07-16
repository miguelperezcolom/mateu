package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.remote.dtos.Crud;
import reactor.core.publisher.Mono;

public interface DynamicCrud {
  Mono<Crud> build();
}
