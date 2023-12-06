package io.mateu.remote.infra.jpa;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.io.IOException;
import java.util.Map;

@Converter
public class JsonConverter implements AttributeConverter<Object, String> {

  private ObjectMapper mapper = new ObjectMapper();

  public JsonConverter() {
    mapper.enable(SerializationFeature.INDENT_OUTPUT);
    mapper.registerModule(new JavaTimeModule());
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
  }

  @Override
  public String convertToDatabaseColumn(Object jsonSerializable) {
    if (jsonSerializable == null) return null;
    else {
      try {
        String json = toJson(jsonSerializable);
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
      Map<String, Object> m = fromJson(s);
      String className = (String) m.get("className");
      return fromJson(s, Class.forName(className));
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  private String toJson(Object o) throws Exception {
    return mapper.writeValueAsString(o);
  }

  private Map<String, Object> fromJson(String json) throws IOException {
    if (json == null || "".equals(json)) json = "{}";
    return mapper.readValue(json, Map.class);
  }

  private <T> T fromJson(String json, Class<T> c) throws Exception {
    if (json == null || "".equals(json)) json = "{}";
    return pojoFromJson(json, c);
  }

  private <T> T pojoFromJson(String json, Class<T> c) throws Exception {
    if (json == null || "".equals(json)) json = "{}";
    return mapper.readValue(json, c);
  }
}
