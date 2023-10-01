package io.mateu.remote.infra.jpa;

import io.mateu.core.domain.store.JourneyContainer;
import io.mateu.core.domain.store.JourneyRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Primary
public class JpaJourneyRepository implements JourneyRepository {

  @Autowired JourneyContainerRepository repo;

  @Override
  public Optional<JourneyContainer> findById(String journeyId) {
    JourneyContainerEntity entity =
        repo.findById(journeyId)
            .map(
                e -> {
                  update(e);
                  return e;
                })
            .toFuture()
            .getNow(null);
    if (entity == null) {
      return Optional.empty();
    }
    return Optional.of(entity.getJourneyContainer());
  }

  @Override
  public void save(JourneyContainer journeyContainer) {
    repo.save(
        new JourneyContainerEntity(
            journeyContainer.getJourneyId(), journeyContainer, LocalDateTime.now()));
  }

  @Override
  public Flux<JourneyContainer> findAll() {
    return repo.findAll().map(e -> e.getJourneyContainer());
  }

  @Override
  public Mono<Long> count() {
    return repo.count();
  }

  @Async
  public void update(JourneyContainerEntity entity) {
    entity.setLastUsed(LocalDateTime.now());
    repo.save(entity);
  }
}
// hola papa
