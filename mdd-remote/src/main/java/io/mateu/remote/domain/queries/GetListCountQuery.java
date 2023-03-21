package io.mateu.remote.domain.queries;

import io.mateu.mdd.shared.interfaces.RpcView;
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
        RpcView rpcView = (RpcView) JourneyStoreService.get().getViewInstance(journeyId, stepId);
        return rpcView.gatherCount(filters);
    }

}
