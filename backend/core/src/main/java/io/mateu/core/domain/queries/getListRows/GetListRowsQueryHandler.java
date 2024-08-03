package io.mateu.core.domain.queries.getListRows;

import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class GetListRowsQueryHandler {

  @Autowired JourneyContainerService store;

  @Autowired ReflectionHelper reflectionHelper;

  @Autowired Serializer serializer;

  @Transactional
  public Flux<Object> run(GetListRowsQuery query) throws Throwable {

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
        (Listing)
            store.getRpcViewInstance(
                query.getJourneyContainer(),
                query.getStepId(),
                query.getListId(),
                query.getServerHttpRequest());

    store.saveFilters(
        query.getJourneyContainer(), query.getStepId(), query.getListId(), filtersDeserialized);
    store.saveOrders(
        query.getJourneyContainer(), query.getStepId(), query.getListId(), query.getOrdering());

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
