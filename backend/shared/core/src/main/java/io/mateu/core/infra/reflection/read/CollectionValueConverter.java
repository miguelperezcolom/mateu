package io.mateu.core.infra.reflection.read;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.pojoFromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
final class CollectionValueConverter {

  static Object convertListValue(
      Field f, Object rawValue, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    if (FileChecker.isFile(f)) {
      List t = new ArrayList();
      List<Map<String, Object>> files = (List) rawValue;
      for (Map<String, Object> o : files) {
        t.add(toFile(f, getGenericClass(f.getGenericType()), o));
      }
      return t;
    }
    if (Integer.class.equals(getGenericClass(f.getGenericType()))) {
      List t = new ArrayList();
      for (Object v : (List) rawValue) {
        t.add(v instanceof String ? Integer.parseInt((String) v) : v);
      }
      return t;
    }
    if (Double.class.equals(getGenericClass(f.getGenericType()))) {
      List t = new ArrayList();
      for (Object v : (List) rawValue) {
        if (v instanceof String) v = Double.parseDouble((String) v);
        else if (v instanceof Integer) v = ((Integer) v).doubleValue();
        t.add(v);
      }
      return t;
    }
    if (getGenericClass(f.getGenericType()).isEnum()) {
      List value = new ArrayList();
      ((List<String>) rawValue)
          .stream()
              .map(
                  m -> {
                    try {
                      return Enum.valueOf(
                          (Class<? extends Enum>) getGenericClass(f.getGenericType()), m);
                    } catch (Exception e) {
                      log.error("Failed to convert enum value {}", m, e);
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(value::add);
      return value;
    }
    if (URL.class.equals(getGenericClass(f.getGenericType()))) {
      List value = new ArrayList();
      ((List<String>) rawValue)
          .stream()
              .map(
                  m -> {
                    try {
                      return new URL(m);
                    } catch (Exception e) {
                      log.error("Failed to convert URL {}", m, e);
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(value::add);
      return value;
    }
    if (!isBasic(getGenericClass(f.getGenericType()))) {
      List value = new ArrayList();
      ((List<Map<String, Object>>) rawValue)
          .stream()
              .map(
                  m -> {
                    try {
                      return pojoFromJson(toJson(m), getGenericClass(f.getGenericType()));
                    } catch (Exception e) {
                      log.error("Failed to convert pojo for field {}", f.getName(), e);
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(value::add);
      return value;
    }
    return rawValue;
  }

  static Object convertArrayValue(
      Field f, List<?> l, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    return ArrayValueConverter.convertArrayValue(f, l, instanceFactory, httpRequest);
  }

  static Map<String, Object> extractFirstMap(Object value) {
    if (Map.class.isAssignableFrom(value.getClass())) {
      return (Map<String, Object>) value;
    } else if (List.class.isAssignableFrom(value.getClass())) {
      var list = ((List<Map<String, Object>>) value);
      return list.size() > 0 ? list.get(0) : null;
    }
    return null;
  }

  private static Object toFile(Field f, Class<?> genericType, Map<String, Object> value) {
    return null;
  }
}
