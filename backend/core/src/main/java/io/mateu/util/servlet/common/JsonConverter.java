package io.mateu.util.servlet.common;

import io.mateu.util.Helper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Map;

@Converter
public class JsonConverter implements AttributeConverter<Object, String> {

  @Override
  public String convertToDatabaseColumn(Object jsonSerializable) {
    if (jsonSerializable == null) return null;
    else {
      try {
        String json = Helper.toJson(jsonSerializable);
        json =
            json.substring(0, 1)
                + " \"className\":\""
                + jsonSerializable.getClass().getName()
                + "\","
                + json.substring(1);
        return json;
      } catch (Exception e) {
        e.printStackTrace();
        return null;
      }
    }
  }

  @Override
  public Object convertToEntityAttribute(String s) {
    if (s == null || "".equals(s)) return null;
    try {
      Map<String, Object> m = Helper.fromJson(s);
      String className = (String) m.get("className");
      Object o = Helper.fromJson(s, Class.forName(className));
      return o;
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }
}