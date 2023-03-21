package io.mateu.remote.domain.store;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JourneyRepository {

    Map<String, JourneyContainer> containers = new HashMap<>();


    public Optional<JourneyContainer> findById(String journeyId) {
        return Optional.ofNullable(containers.get(journeyId));
    }

    public void save(JourneyContainer journeyContainer) {
        containers.put(journeyContainer.getJourneyId(), journeyContainer);
    }
}
