package io.mateu.util.common;

import io.mateu.util.Helper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.io.IOException;
import java.util.Map;

@Converter
public class YamlConverter implements AttributeConverter<Object, String> {


    @Override
    public String convertToDatabaseColumn(Object jsonSerializable) {
        if (jsonSerializable == null) return null;
        else {
            try {
                String json = Helper.toYaml(jsonSerializable);
                json = "className:\"" + jsonSerializable.getClass().getName() + "\"\n" + json;
                return json;
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }
        }
    }

    @Override
    public Object convertToEntityAttribute(String s) {
        if (s == null || "".equals(s)) return null;
        try {
            Map<String, Object> m = Helper.fromYaml(s);
            String className = (String) m.get("className");
            Object o = Helper.fromYaml(s, Class.forName(className));
            return o;
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }
}
