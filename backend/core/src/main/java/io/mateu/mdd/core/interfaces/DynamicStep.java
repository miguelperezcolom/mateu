package io.mateu.mdd.core.interfaces;

import io.mateu.remote.dtos.Step;
import reactor.core.publisher.Mono;

public interface DynamicStep {
  Mono<Step> build();
}