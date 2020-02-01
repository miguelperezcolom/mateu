package io.mateu.mdd.tester.model.tests.mappings.maps.c9BasicEntityOneToManyWithConverter;

import com.google.common.base.Strings;
import io.mateu.mdd.core.util.Helper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Converter
public class C9Converter implements AttributeConverter<Map<String, C9Son>, String> {


    @Override
    public String convertToDatabaseColumn(Map<String, C9Son> map) {
        String json = null;
        if (map != null) {
            Map<Object, Object> aux = new HashMap<>();
            for (Object k : map.keySet()) {
                aux.put(k, map.get(k).getName());
            }
            try {
                json = Helper.toJson(aux);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return json;
    }

    @Override
    public Map<String, C9Son> convertToEntityAttribute(String json) {
        Map<String, C9Son> m = null;
        if (!Strings.isNullOrEmpty(json)) {
            try {
                m = new HashMap();
                Map<String, Object> aux = Helper.fromJson(json);
                for (String k : aux.keySet()) {
                    m.put(k, new C9Son((String) aux.get(k)));
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return m;
    }
}
