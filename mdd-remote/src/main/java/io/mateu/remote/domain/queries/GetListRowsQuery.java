package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetListRowsQuery {

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;

    private Object filters;

    private int page;

    private int pageSize;

    private List<SortCriteria> ordering;

    public List<Object> run() throws Throwable {
        Listing rpcView = (Listing) JourneyStoreService.get().getRpcViewInstance(journeyId, stepId, listId);
        return rpcView.fetchRows(filters, ordering, page * pageSize, (page + 1) * pageSize - 1);
    }

}
