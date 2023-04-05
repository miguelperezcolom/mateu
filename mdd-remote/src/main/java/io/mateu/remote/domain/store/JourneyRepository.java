package io.mateu.remote.domain.store;

import java.util.List;
import java.util.Optional;

public interface JourneyRepository {

    Optional<JourneyContainer> findById(String journeyId);

    void save(JourneyContainer journeyContainer);

    List<JourneyContainer> findAll();

    long count();
}
