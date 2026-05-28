package io.mateu.core.infra.reflection.read;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromMap;
import static io.mateu.core.infra.JsonSerializer.pojoFromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.FileChecker.isFile;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ActualValueExtractor {

  private static boolean checkInjected(Object viewInstance, String fieldName) {
    Field field = getFieldByName(viewInstance.getClass(), fieldName);
    return field != null
        && (field.isAnnotationPresent(Inject.class) || Modifier.isFinal(field.getModifiers()));
  }

  public static Object getActualValue(
      Map.Entry<String, Object> entry,
      Object object,
      InstanceFactory instanceFactory,
      HttpRequest httpRequest)
      throws Exception {
    Object targetValue = entry.getValue();
    Field f = getFieldByName(object.getClass(), entry.getKey());
    if (f == null) {
      return targetValue;
    }
    if (checkInjected(object, f.getName())) {
      Object injectedValue = getValue(f, object);
      if (injectedValue != null && entry.getValue() != null && entry.getValue() instanceof Map) {
        Map<String, Object> incomingValues = (Map<String, Object>) entry.getValue();
        for (Field crudField : getAllEditableFields(injectedValue.getClass())) {
          setValue(crudField, injectedValue, incomingValues.get(crudField.getName()));
        }
      }
      return injectedValue;
    }
    if (targetValue == null) {
      return targetValue;
    }
    if (entry.getValue() != null) {
      if (entry.getValue() instanceof Component) {
        return null;
      }
      if (Component.class.isAssignableFrom(f.getType())) {
        return null;
      }
      if (Callable.class.isAssignableFrom(f.getType())) {
        return null;
      }
      if (List.class.isAssignableFrom(f.getType())) {
        return convertListValue(f, entry.getValue(), instanceFactory, httpRequest);
      }

      if (f.getType().isArray()) {
        if (List.class.isAssignableFrom(entry.getValue().getClass())) {
          return convertArrayValue(f, (List) entry.getValue(), instanceFactory, httpRequest);
        }
      }
      if (!f.getType().isAssignableFrom(entry.getValue().getClass())) {
        if (isFile(f)) {
          Map<String, Object> value = extractFirstMap(entry.getValue());
          if (value == null) {
            targetValue = null;
          } else {
            Class<?> genericType = f.getType();
            targetValue = toFile(f, genericType, value);
          }
        } else if (entry.getValue() instanceof String) {
          targetValue =
              TypeCoercionHelper.getActualValue(
                  f.getType(), entry.getValue(), instanceFactory, httpRequest);
        } else if (entry.getValue() instanceof Map) {
          targetValue = fromMap((Map<String, Object>) entry.getValue(), f.getType());
        } else if (float.class.equals(f.getType())) {
          if (entry.getValue() instanceof Double doubleValue) {
            targetValue = doubleValue.floatValue();
          }
        } else if (Float.class.equals(f.getType())) {
          if (entry.getValue() instanceof Double doubleValue) {
            targetValue = doubleValue.floatValue();
          }
        } else if (BigDecimal.class.equals(f.getType())) {
          if (entry.getValue() instanceof Double doubleValue) {
            targetValue = BigDecimal.valueOf(doubleValue);
          }
          if (entry.getValue() instanceof Integer integer) {
            targetValue = BigDecimal.valueOf(integer);
          }
          if (entry.getValue() instanceof Long longValue) {
            targetValue = BigDecimal.valueOf(longValue);
          }
          if (entry.getValue() instanceof Float floatValue) {
            targetValue = BigDecimal.valueOf(floatValue);
          }
        }
      }
    }
    return targetValue;
  }

  private static Object convertListValue(
      Field f, Object rawValue, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    if (isFile(f)) {
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

  private static Object convertArrayValue(
      Field f, List l, InstanceFactory instanceFactory, HttpRequest httpRequest) throws Exception {
    if (boolean[].class.equals(f.getType())) {
      boolean[] t = new boolean[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        t[i] = v instanceof Boolean && ((Boolean) v).booleanValue();
      }
      return t;
    }
    if (int[].class.equals(f.getType())) {
      int[] t = new int[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        if (v instanceof Integer) t[i] = ((Integer) v).intValue();
        else if (v instanceof String) t[i] = Integer.parseInt((String) v);
      }
      return t;
    }
    if (double[].class.equals(f.getType())) {
      double[] t = new double[l.size()];
      for (int i = 0; i < l.size(); i++) {
        Object v = l.get(i);
        if (v instanceof Double) t[i] = ((Double) v).doubleValue();
        else if (v instanceof Integer) t[i] = ((Integer) v).doubleValue();
      }
      return t;
    }
    if (String[].class.equals(f.getType())) {
      return l.toArray(new String[0]);
    }
    if (f.getType().getComponentType().isEnum()) {
      List t = new ArrayList();
      for (Object v : l) {
        t.add(Enum.valueOf((Class) f.getType().getComponentType(), (String) v));
      }
      return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
    }
    List t = new ArrayList();
    for (Object v : l) {
      t.add(
          TypeCoercionHelper.getActualValue(
              f.getType().getComponentType(), v, instanceFactory, httpRequest));
    }
    return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
  }

  private static Map<String, Object> extractFirstMap(Object value) {
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
