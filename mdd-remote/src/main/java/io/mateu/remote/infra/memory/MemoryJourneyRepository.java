package io.mateu.remote.infra.memory;

import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MemoryJourneyRepository implements JourneyRepository {

    Map<String, JourneyContainer> containers = new HashMap<>();


    public Optional<JourneyContainer> findById(String journeyId) {
        return Optional.ofNullable(containers.get(journeyId));
    }

    public void save(JourneyContainer journeyContainer) {
        containers.put(journeyContainer.getJourneyId(), journeyContainer);
    }

    @Override
    public List<JourneyContainer> findAll() {
        return containers.values().stream().toList();
    }

    @Override
    public long count() {
        return containers.size();
    }
}
