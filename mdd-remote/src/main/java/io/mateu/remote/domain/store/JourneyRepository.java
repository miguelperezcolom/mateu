package io.mateu.remote.domain.store;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;

public interface JourneyRepository {

    Optional<JourneyContainer> findById(String journeyId);

    void save(JourneyContainer journeyContainer);

    Flux<JourneyContainer> findAll();

    Mono<Long> count();
}
