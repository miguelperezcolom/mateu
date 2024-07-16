package io.mateu.core.domain.queries.getJourney;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetJourneyQueryHandler {

  @Autowired JourneyStoreService store;

  public Mono<Journey> run(GetJourneyQuery query) throws Exception {

    String journeyId = query.getJourneyId();

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + journeyId);
    }

    return Mono.just(store.getJourney(journeyId));
  }
}
