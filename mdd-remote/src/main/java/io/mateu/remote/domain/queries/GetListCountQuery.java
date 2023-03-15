package io.mateu.remote.domain.queries;

import io.mateu.mdd.core.interfaces.ListView;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import lombok.*;

import java.util.Map;

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
        RpcView rpcView = (RpcView) JourneyStoreAccessor.get().getViewInstance(journeyId, stepId);
        return rpcView.gatherCount(filters);
    }

}
