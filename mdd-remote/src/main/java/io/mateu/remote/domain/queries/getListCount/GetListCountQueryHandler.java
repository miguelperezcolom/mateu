package io.mateu.remote.domain.queries.getListCount;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GetListCountQueryHandler {

    public long run(GetListCountQuery query) throws Throwable {
        Listing rpcView = JourneyStoreService.get().getRpcViewInstance(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId());
        return rpcView.fetchCount(query.getFilters());
    }

}
