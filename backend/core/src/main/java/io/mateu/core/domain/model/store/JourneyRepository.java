package io.mateu.core.domain.model.store;

import java.util.Optional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface JourneyRepository {

  Optional<JourneyContainer> findById(String journeyId);

  void save(JourneyContainer journeyContainer);

  Flux<JourneyContainer> findAll();

  Mono<Long> count();
}
