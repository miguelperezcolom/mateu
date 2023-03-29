package io.mateu.remote.infra.jpa;

import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service@Primary
public class JpaJourneyRepository implements JourneyRepository {

    @Autowired
    JourneyContainerRepository repo;

    @Override
    public Optional<JourneyContainer> findById(String journeyId) {
        Optional<JourneyContainerEntity> entity = repo.findById(journeyId);
        if (entity.isPresent()) {
            update(entity.get());
        }
        return entity.map(e -> e.getJourneyContainer());
    }

    @Override
    public void save(JourneyContainer journeyContainer) {
        repo.save(new JourneyContainerEntity(journeyContainer.getJourneyId(), journeyContainer, LocalDateTime.now()));
    }

    @Async
    public void update(JourneyContainerEntity entity) {
        entity.setLastUsed(LocalDateTime.now());
        repo.save(entity);
    }
}
