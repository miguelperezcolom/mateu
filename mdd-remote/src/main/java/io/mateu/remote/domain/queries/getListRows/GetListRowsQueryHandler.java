package io.mateu.remote.domain.queries.getListRows;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class GetListRowsQueryHandler {

    public List<Object> run(GetListRowsQuery query) throws Throwable {
        Listing rpcView = (Listing) JourneyStoreService.get().getRpcViewInstance(
                query.getJourneyId(),
                query.getStepId(),
                query.getListId());
        return rpcView.fetchRows(
                query.getFilters(),
                query.getOrdering(),
                query.getPage() * query.getPageSize(),
                (query.getPage() + 1) * query.getPageSize() - 1);
    }
}
