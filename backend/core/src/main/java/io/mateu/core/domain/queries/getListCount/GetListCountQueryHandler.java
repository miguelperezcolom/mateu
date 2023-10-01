package io.mateu.core.domain.queries.getListCount;

import com.google.common.base.Strings;
import io.mateu.core.application.FiltersDeserializer;
import io.mateu.core.application.MateuRemoteClient;
import io.mateu.core.domain.store.JourneyContainer;
import io.mateu.core.domain.store.JourneyStoreService;
import io.mateu.mdd.shared.interfaces.Listing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetListCountQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired MateuRemoteClient mateuRemoteClient;

  public Mono<Long> run(GetListCountQuery query) throws Throwable {

    JourneyContainer journeyContainer = store.findJourneyById(query.getJourneyId()).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + query.getJourneyId());
    }

    if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
      return mateuRemoteClient.getListCount(
          journeyContainer.getRemoteBaseUrl(),
          journeyContainer.getRemoteJourneyTypeId(),
          journeyContainer.getJourneyId(),
          query.getStepId(),
          query.getListId(),
          query.getFilters(),
          query.getServerHttpRequest());
    }

    Object filtersDeserialized =
        new FiltersDeserializer(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId(),
                query.getFilters(),
                query.getServerHttpRequest())
            .deserialize(store);

    Listing rpcView =
        store.getRpcViewInstance(
            query.getJourneyId(),
            query.getStepId(),
            query.getListId(),
            query.getServerHttpRequest());

    if (rpcView == null) {
      return Mono.just(0l);
    }

    return rpcView.fetchCount(filtersDeserialized);
  }
}
