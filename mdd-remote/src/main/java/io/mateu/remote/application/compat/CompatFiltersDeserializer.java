package io.mateu.remote.application.compat;

import io.mateu.remote.application.FiltersDeserializer;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class CompatFiltersDeserializer extends FiltersDeserializer {

    public CompatFiltersDeserializer(String journeyId, String stepId, String listId, String raw) {
        super(journeyId, stepId, listId, raw);
    }

    @Override
    protected Map<String, Object> decodeAndParse(String raw) throws IOException {
        Map<String, Object> map = super.decodeAndParse(raw);
        for (String key : map.keySet()) {
            Object value = map.get(key);
            if (value != null && value.getClass().isArray()) {
                Object[] values = (Object[]) value;
                if (values.length > 0) {
                    value = values[0];
                } else {
                    value = null;
                }
            } else if (value != null && List.class.isAssignableFrom(value.getClass())) {
                List values = (List) value;
                if (values.size() > 0) {
                    value = values.get(0);
                } else {
                    value = null;
                }
            }
            map.put(key, value);
        }
        return map;
    }

}
