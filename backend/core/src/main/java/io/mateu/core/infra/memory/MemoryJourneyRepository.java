package io.mateu.core.infra.memory;

import io.mateu.core.domain.store.JourneyContainer;
import io.mateu.core.domain.store.JourneyRepository;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class MemoryJourneyRepository implements JourneyRepository {

  Map<String, JourneyContainer> containers = new HashMap<>();

  public Optional<JourneyContainer> findById(String journeyId) {
    return Optional.ofNullable(containers.get(journeyId));
  }

  public void save(JourneyContainer journeyContainer) {
    containers.put(journeyContainer.getJourneyId(), journeyContainer);
  }

  @Override
  public Flux<JourneyContainer> findAll() {
    return Flux.fromStream(containers.values().stream());
  }

  @Override
  public Mono<Long> count() {
    return Mono.just((long) containers.size());
  }

  @PostConstruct
  public void init() {
    new Thread(
            () -> {
              boolean loop = true;
              while (loop) {
                try {
                  List<String> containersIdToRemove = new ArrayList<>();
                  LocalDateTime expiryTime = LocalDateTime.now().minusHours(1);
                  containers.forEach(
                      (id, container) -> {
                        if (container.getLastAccess().isBefore(expiryTime)) {
                          log.info("will remove journey " + id + " due to inactivity");
                          containersIdToRemove.add(id);
                        }
                      });
                  containersIdToRemove.forEach(id -> containers.remove(id));
                } catch (Exception e) {
                  log.error("exception on journey store cleanup", e);
                }

                try {
                  Thread.sleep(60000l);
                } catch (InterruptedException e) {
                  loop = false;
                }
              }
            })
        .start();
  }
}
