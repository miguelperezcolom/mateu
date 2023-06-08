package io.mateu.remote.application;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.data.DatesRange;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class FiltersDeserializer {

    private final String journeyId;
    private final String stepId;
    private final String listId;
    private final String raw;
    private final ServerHttpRequest serverHttpRequest;

    public FiltersDeserializer(String journeyId, String stepId, String listId, String raw
            , ServerHttpRequest serverHttpRequest) {
        this.journeyId = journeyId;
        this.stepId = stepId;
        this.listId = listId;
        this.raw = raw;
        this.serverHttpRequest = serverHttpRequest;
    }

    public Object deserialize(JourneyStoreService store) throws Exception {
        Listing rpcView = store.getRpcViewInstance(journeyId, stepId, listId, serverHttpRequest);
        if (rpcView == null) {
            return null;
        }
        Map<String, Object> map = decodeAndParse(raw);
        for (FieldInterfaced field : ReflectionHelper.getAllEditableFields(rpcView.getSearchFormClass())) {
            if (DatesRange.class.equals(field.getType())) {
                String rawDatesRangeValue = "";
                if (map.containsKey(field.getId() + "_from") && map.get(field.getId() + "_from") != null) {
                    rawDatesRangeValue += map.get(field.getId() + "_from");
                }
                rawDatesRangeValue += "#";
                if (map.containsKey(field.getId() + "_to") && map.get(field.getId() + "_to") != null) {
                    rawDatesRangeValue += map.get(field.getId() + "_to");
                }
                map.put(field.getId(), rawDatesRangeValue);
            }
            if (boolean.class.equals(field.getType())) {
                boolean value = false;
                if (map.get(field.getId()) != null) {
                    Object object = map.get(field.getId());
                    if (List.class.isAssignableFrom(object.getClass())) {
                        List list = (List) object;
                        if (list.size() > 0) {
                            value = "on".equals(list.get(0));
                        }
                    }
                }
                map.put(field.getId(), value);
            }
            if (map.containsKey(field.getId()) && field.getType().isEnum()) {
                if (Strings.isNullOrEmpty((String) map.get(field.getId()))) {
                    map.remove(field.getId());
                } else {
                    map.put(field.getId(), Enum.valueOf((Class) field.getType(), (String) map.get(field.getId())));
                }
            }
        }
        if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName())) {
            return map;
        }
        return Helper.fromJson(Helper.toJson(map),
                rpcView.getSearchFormClass());
    }

    protected Map<String, Object> decodeAndParse(String raw) throws IOException {
        return Helper.fromJson(new String(Base64.getDecoder().decode(raw)));
    }
}
