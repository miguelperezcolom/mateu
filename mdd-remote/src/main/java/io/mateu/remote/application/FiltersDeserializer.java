package io.mateu.remote.application;

import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.util.Helper;

public class FiltersDeserializer {

    private final String journeyId;
    private final String stepId;
    private final String listId;
    private final String raw;

    public FiltersDeserializer(String journeyId, String stepId, String listId, String raw) {
        this.journeyId = journeyId;
        this.stepId = stepId;
        this.listId = listId;
        this.raw = raw;
    }

    public Object deserialize() throws Exception {
        RpcView rpcView = (RpcView) JourneyStoreAccessor.get().getViewInstance(stepId);
        if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName())) { //todo: check si es jpa
            return Helper.fromJson(raw);
        }
        return Helper.fromJson(raw, rpcView.getSearchFormClass());
    }
}
