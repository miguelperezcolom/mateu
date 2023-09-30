package io.mateu.remote.infra.jpa;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

public interface JourneyContainerRepository
    extends ReactiveCrudRepository<JourneyContainerEntity, String> {}
