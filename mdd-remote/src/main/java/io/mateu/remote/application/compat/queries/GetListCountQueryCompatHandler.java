package io.mateu.remote.application.compat.queries;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.application.compat.CompatFiltersDeserializer;
import io.mateu.remote.domain.queries.getListCount.GetListCountQuery;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetListCountQueryCompatHandler {

    @Autowired
    JourneyStoreService store;

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    public Mono<Long> run(GetListCountQuery query) throws Throwable {

        JourneyContainer journeyContainer = store.findJourneyById(query.getJourneyId()).orElse(null);

        if (journeyContainer == null) {
            throw new Exception("No journey with id " + query.getJourneyId());
        }

        if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
            return mateuRemoteClient.getListCount(journeyContainer.getRemoteBaseUrl(),
                    journeyContainer.getRemoteJourneyTypeId(), journeyContainer.getJourneyId(), query.getStepId(),
                    query.getListId(), query.getFilters()
            );
        }

        Object filtersDeserialized = new CompatFiltersDeserializer(
                query.getJourneyId()
                , query.getStepId(), query.getListId(), query.getFilters()).deserialize(store);

        Listing rpcView = store.getRpcViewInstance(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId());
        return rpcView.fetchCount(filtersDeserialized);
    }

}
