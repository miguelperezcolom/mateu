package io.mateu.remote.application;

import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.util.Helper;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

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
        if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName())) {
            return Helper.fromJson(new String(Base64.getDecoder().decode(raw)));
        }
        return Helper.fromJson(new String(Base64.getDecoder().decode(raw)),
                rpcView.getSearchFormClass());
    }
}
