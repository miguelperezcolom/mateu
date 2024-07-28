package io.mateu.core.domain.queries.getListCount;

import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.model.util.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetListCountQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired ReflectionHelper reflectionHelper;

  @Autowired Serializer serializer;

  public Mono<Long> run(GetListCountQuery query) throws Throwable {

    Object filtersDeserialized =
        new FiltersDeserializer(
                query.getJourneyContainer(),
                query.getStepId(),
                query.getListId(),
                query.getFilters(),
                query.getServerHttpRequest(),
                reflectionHelper,
                serializer)
            .deserialize(store);

    Listing rpcView =
        store.getRpcViewInstance(
            query.getJourneyContainer(),
            query.getStepId(),
            query.getListId(),
            query.getServerHttpRequest());

    if (rpcView == null) {
      return Mono.just(0l);
    }

    return rpcView.fetchCount(filtersDeserialized);
  }
}
