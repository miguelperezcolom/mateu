package io.mateu.remote.application;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;

import java.util.Base64;
import java.util.Map;

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
        RpcView rpcView = (RpcView) JourneyStoreService.get().getViewInstance(journeyId, stepId);
        if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName())) {
            Map<String, Object> map = Helper.fromJson(new String(Base64.getDecoder().decode(raw)));
            for (FieldInterfaced field : ReflectionHelper.getAllEditableFields(rpcView.getSearchFormClass())) {
                if (map.containsKey(field.getId()) && field.getType().isEnum()) {
                    if (Strings.isNullOrEmpty((String) map.get(field.getId()))) {
                        map.remove(field.getId());
                    } else {
                        map.put(field.getId(), Enum.valueOf((Class) field.getType(), (String) map.get(field.getId())));
                    }
                }
            }
            return map;
        }
        return Helper.fromJson(new String(Base64.getDecoder().decode(raw)),
                rpcView.getSearchFormClass());
    }
}
