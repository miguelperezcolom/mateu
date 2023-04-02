package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetListCountQuery {

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;


    private Object filters;

    public long run() throws Throwable {
        Listing rpcView = (Listing) JourneyStoreService.get().getRpcViewInstance(journeyId, stepId, listId);
        return rpcView.fetchCount(filters);
    }

}
