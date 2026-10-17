package io.mateu.core.infra;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.introspect.AnnotatedField;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.reflection.LegacyDateTimes;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Modifier;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

public final class JsonSerializer {

  private static final ObjectMapper mapper = new ObjectMapper();

  static {
    mapper.enable(SerializationFeature.INDENT_OUTPUT);
    mapper.registerModule(new JavaTimeModule());
    mapper.registerModule(legacyDateTimes());
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
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

  /**
   * java.util.Date, java.sql.Date and ZonedDateTime as the local ISO date-time the date-time
   * pickers read and write (see {@link LegacyDateTimes}) — registered after JavaTimeModule, so it
   * wins for ZonedDateTime too.
   */
  private static SimpleModule legacyDateTimes() {
    var module = new SimpleModule("mateu-legacy-date-times");
    var serializer =
        new com.fasterxml.jackson.databind.JsonSerializer<Object>() {
          @Override
          public void serialize(Object value, JsonGenerator gen, SerializerProvider serializers)
              throws IOException {
            gen.writeString(LegacyDateTimes.format(value));
          }
        };
    module.addSerializer(Date.class, serializer);
    module.addSerializer(java.sql.Date.class, serializer);
    module.addSerializer(ZonedDateTime.class, serializer);
    module.addDeserializer(Date.class, deserializer(Date.class));
    module.addDeserializer(java.sql.Date.class, deserializer(java.sql.Date.class));
    module.addDeserializer(ZonedDateTime.class, deserializer(ZonedDateTime.class));
    return module;
  }

  private static <T> JsonDeserializer<T> deserializer(Class<T> type) {
    return new JsonDeserializer<>() {
      @Override
      public T deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        Object raw =
            p.currentToken().isNumeric()
                ? (Object) p.getLongValue()
                : (Object) p.getValueAsString();
        return type.cast(LegacyDateTimes.parse(raw, type));
      }
    };
  }

  // Jackson's checked JsonProcessingException (an IOException) is wrapped in UncheckedIOException
  // so
  // callers don't need @SneakyThrows — a malformed payload surfaces as itself, not as the
  // NoClassDefFoundError: lombok/Lombok that @SneakyThrows produced when lombok is off runtime.
  public static String toJson(Object object) {
    try {
      return mapper.writeValueAsString(object);
    } catch (JsonProcessingException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static <T> T fromMap(Map<String, Object> map, Class<T> c) throws Exception {
    if (map == null) {
      return null;
    }
    String json = toJson(map);
    return pojoFromJson(json, c);
  }

  public static <T> T pojoFromJson(String json, Class<T> c) {
    if (json == null || json.isEmpty()) json = "{}";
    try {
      return mapper.readValue(json, c);
    } catch (JsonProcessingException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static <T> List<T> listFromJson(String json, Class<T> c) {
    if (json == null || json.isEmpty()) json = "[]";
    try {
      return mapper.readerForListOf(c).readValue(json);
    } catch (JsonProcessingException e) {
      throw new UncheckedIOException(e);
    }
  }

  public static Map<String, Object> fromJson(String json) {
    if (json == null || "".equals(json)) json = "{}";
    try {
      return mapper.readValue(json, Map.class);
    } catch (JsonProcessingException e) {
      throw new UncheckedIOException(e);
    }
  }
}
