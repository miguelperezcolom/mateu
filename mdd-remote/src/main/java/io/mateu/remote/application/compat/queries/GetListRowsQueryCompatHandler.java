package io.mateu.remote.application.compat.queries;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.application.compat.CompatFiltersDeserializer;
import io.mateu.remote.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.List;

@Service
@Slf4j
public class GetListRowsQueryCompatHandler {

    @Autowired
    JourneyStoreService store;

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    public Flux<Object> run(GetListRowsQuery query) throws Throwable {

        JourneyContainer journeyContainer = store.findJourneyById(query.getJourneyId()).orElse(null);

        if (journeyContainer == null) {
            throw new Exception("No journey with id " + query.getJourneyId());
        }

        if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
            return mateuRemoteClient.getListRows(journeyContainer.getRemoteBaseUrl(),
                    journeyContainer.getRemoteJourneyTypeId(), journeyContainer.getJourneyId(),
                    query.getStepId(),
                    query.getListId(),
                    query.getFilters(),
                    query.getOrdering(),
                    query.getPage(),
                    query.getPageSize(),
                    query.getServerHttpRequest());
        }

        Object filtersDeserialized = new CompatFiltersDeserializer(
                query.getJourneyId()
                , query.getStepId(), query.getListId(), query.getFilters(), query.getServerHttpRequest())
                .deserialize(store);

        Listing rpcView = (Listing) store.getRpcViewInstance(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId(),
                query.getServerHttpRequest());
        return rpcView.fetchRows(
                filtersDeserialized,
                query.getOrdering(),
                query.getPage() * query.getPageSize(),
                (query.getPage() + 1) * query.getPageSize() - 1);
    }
}
