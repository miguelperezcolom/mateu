package io.mateu.core.domain.queries.getListCount;

import com.google.common.base.Strings;
import io.mateu.core.domain.apiClients.MateuRemoteClient;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetListCountQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired MateuRemoteClient mateuRemoteClient;

  @Autowired
  ReflectionHelper reflectionHelper;

  @Autowired
  Serializer serializer;

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
                query.getServerHttpRequest(),
                reflectionHelper,
                serializer)
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
