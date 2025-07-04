package io.mateu.core.infra;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.introspect.AnnotatedField;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;
import java.io.IOException;
import java.lang.reflect.Modifier;
import java.util.Map;
import lombok.SneakyThrows;

public final class JsonSerializer {

  private static final ObjectMapper mapper = new ObjectMapper();

  static {
    mapper.enable(SerializationFeature.INDENT_OUTPUT);
    // mapper.registerModule(new JavaTimeModule());
    /*
    SimpleModule module = new SimpleModule();
    module.addSerializer(IconChooser.class, new IconChooserSerializer());
    mapper.registerModule(module);
     */
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    // mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.NONE);
    mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.NON_PRIVATE);
    mapper.setVisibility(
        new VisibilityChecker.Std(JsonAutoDetect.Visibility.NON_PRIVATE) {
          @Override
          public boolean isFieldVisible(java.lang.reflect.Field f) {
            if (Modifier.isFinal(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
              return false;
            }
            return super.isFieldVisible(f);
          }

          @Override
          public boolean isFieldVisible(AnnotatedField f) {
            if (Modifier.isFinal(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
              return false;
            }
            return super.isFieldVisible(f);
          }
        });
  }

  private JsonSerializer() {}

  @SneakyThrows
  public static String toJson(Object object) {
    return mapper.writeValueAsString(object);
  }

  public static <T> T fromMap(Map<String, Object> map, Class<T> c) throws Exception {
    if (map == null) {
      return null;
    }
    String json = toJson(map);
    return pojoFromJson(json, c);
  }

  public static <T> T pojoFromJson(String json, Class<T> c) throws Exception {
    if (json == null || json.isEmpty()) json = "{}";
    return mapper.readValue(json, c);
  }

  public static Map<String, Object> fromJson(String json) throws IOException {
    if (json == null || "".equals(json)) json = "{}";
    return mapper.readValue(json, Map.class);
  }
}
