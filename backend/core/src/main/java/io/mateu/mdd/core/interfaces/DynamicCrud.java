package io.mateu.mdd.core.interfaces;

import io.mateu.remote.dtos.Crud;
import reactor.core.publisher.Mono;

public interface DynamicCrud {
  Mono<Crud> build();
}
