package io.mateu.core.domain.queries.getListRows;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class GetListRowsQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired ReflectionHelper reflectionHelper;

  @Autowired Serializer serializer;

  @Transactional
  public Flux<Object> run(GetListRowsQuery query) throws Throwable {

    JourneyContainer journeyContainer = store.findJourneyById(query.getJourneyId()).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + query.getJourneyId());
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
        (Listing)
            store.getRpcViewInstance(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId(),
                query.getServerHttpRequest());

    store.saveFilters(
        query.getJourneyId(), query.getStepId(), query.getListId(), filtersDeserialized);
    store.saveOrders(
        query.getJourneyId(), query.getStepId(), query.getListId(), query.getOrdering());

    if (rpcView == null) {
      return Flux.empty();
    }

    return rpcView.fetchRows(
        filtersDeserialized,
        query.getOrdering(),
        query.getPage() * query.getPageSize(),
        query.getPageSize());
  }
}
