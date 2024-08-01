package io.mateu.core.domain.commands.runStepAction;

import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.files.StorageService;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import jakarta.persistence.Entity;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.naming.AuthenticationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActualValueExtractor {

  final FileChecker fileChecker;
  final StorageService storageService;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  public Object getActualValue(Class targetType, Object value) throws Exception {
    Object targetValue = value;
    if (value == null) {
      if (int.class.equals(targetType)) {
        return 0;
      }
      if (long.class.equals(targetType)) {
        return 0l;
      }
      if (float.class.equals(targetType)) {
        return 0f;
      }
      if (double.class.equals(targetType)) {
        return 0.0;
      }
      if (boolean.class.equals(targetType)) {
        return false;
      }
      return null;
    }
    if (!targetType.equals(value.getClass())) {
      if (int.class.equals(targetType)) {
        targetValue = Integer.parseInt("" + value);
      } else if (long.class.equals(targetType)) {
        targetValue = Long.parseLong("" + value);
      } else if (double.class.equals(targetType)) {
        targetValue = Double.parseDouble("" + value);
      } else if (float.class.equals(targetType)) {
        targetValue = Float.parseFloat("" + value);
      } else if (boolean.class.equals(targetType)) {
        targetValue = Boolean.parseBoolean("" + value);
      } else if (Integer.class.equals(targetType)) {
        targetValue = Integer.parseInt("" + value);
      } else if (Long.class.equals(targetType)) {
        targetValue = Long.parseLong("" + value);
      } else if (Double.class.equals(targetType)) {
        targetValue = Double.parseDouble("" + value);
      } else if (Float.class.equals(targetType)) {
        targetValue = Float.parseFloat("" + value);
      } else if (Boolean.class.equals(targetType)) {
        targetValue = Boolean.parseBoolean("" + value);
      } else if (LocalDate.class.equals(targetType)) {
        targetValue = LocalDate.parse("" + value);
      } else if (LocalDateTime.class.equals(targetType)) {
        targetValue = LocalDateTime.parse("" + value);
      } else if (LocalTime.class.equals(targetType)) {
        targetValue = LocalTime.parse("" + value);
      } else if (targetType.isEnum()) {
        targetValue = Enum.valueOf(targetType, "" + value);
      } else if (Class.class.equals(targetType)) {
        targetValue = Class.forName("" + value);
      }
    }
    return targetValue;
  }

  private boolean checkInjected(Object viewInstance, String fieldName) {
    FieldInterfaced field = reflectionHelper.getFieldByName(viewInstance.getClass(), fieldName);
    return field != null
        && (field.isAnnotationPresent(Autowired.class) || Modifier.isFinal(field.getModifiers()));
  }

  public Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance)
      throws Exception {
    Object targetValue = entry.getValue();
    FieldInterfaced f = reflectionHelper.getFieldByName(viewInstance.getClass(), entry.getKey());
    if (f == null) {
      return targetValue;
    }
    if (checkInjected(viewInstance, f.getId())) {
      Object injectedValue = reflectionHelper.getValue(f, viewInstance);
      if (injectedValue != null && entry.getValue() != null && entry.getValue() instanceof Map) {
        Map<String, Object> incomingValues = (Map<String, Object>) entry.getValue();
        for (FieldInterfaced crudField :
            reflectionHelper.getAllEditableFields(injectedValue.getClass())) {
          reflectionHelper.setValue(
              crudField, injectedValue, incomingValues.get(crudField.getId()));
        }
      }
      return injectedValue;
    }
    if (targetValue == null) {
      return targetValue;
    }
    if (entry.getValue() != null) {
      if (List.class.isAssignableFrom(f.getType())) {
        if (fileChecker.isFile(f)) {
          List t = new ArrayList();
          List<Map<String, Object>> files = (List) entry.getValue();
          for (Map<String, Object> o : files) {
            t.add(toFile(f, reflectionHelper.getGenericClass(f.getGenericType()), o));
          }
          return t;
        }
        if (ExternalReference.class.equals(reflectionHelper.getGenericClass(f.getGenericType()))) {
          List t = new ArrayList();
          List l = (List) entry.getValue();
          for (Object o : l) {
            if (o instanceof String) {
              t.add(new ExternalReference(o, ""));
              continue;
            }
            Map<String, Object> m = (Map<String, Object>) o;
            t.add(new ExternalReference(m.get("value"), (String) m.get("key")));
          }
          return t;
        }
        if (Integer.class.equals(reflectionHelper.getGenericClass(f.getGenericType()))) {
          List t = new ArrayList();
          List l = (List) entry.getValue();
          for (Object v : l) {
            if (v instanceof String) {
              v = Integer.parseInt((String) v);
            }
            t.add(v);
          }
          return t;
        }
        if (Double.class.equals(reflectionHelper.getGenericClass(f.getGenericType()))) {
          List t = new ArrayList();
          List l = (List) entry.getValue();
          for (Object v : l) {
            if (v instanceof String) {
              v = Double.parseDouble((String) v);
            }
            if (v instanceof Integer) {
              v = ((Integer) v).doubleValue();
            }
            t.add(v);
          }
          return t;
        }
        if (f.getGenericClass().isEnum()) {
          List value = new ArrayList();
          List<String> in = (List<String>) entry.getValue();
          in.stream()
              .map(
                  m -> {
                    try {
                      return Enum.valueOf((Class<? extends Enum>) f.getGenericClass(), m);
                    } catch (Exception e) {
                      e.printStackTrace();
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(v -> value.add(v));
          return value;
        }
        if (URL.class.equals(f.getGenericClass())) {
          List value = new ArrayList();
          List<String> in = (List<String>) entry.getValue();
          in.stream()
              .map(
                  m -> {
                    try {
                      return new URL(m);
                    } catch (Exception e) {
                      e.printStackTrace();
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(v -> value.add(v));
          return value;
        }
        if (!reflectionHelper.isBasic(f.getGenericClass())) {
          List value = new ArrayList();
          List<Map<String, Object>> in = (List<Map<String, Object>>) entry.getValue();
          in.stream()
              .map(
                  m -> {
                    try {
                      return serializer.fromJson(serializer.toJson(m), f.getGenericClass());
                    } catch (Exception e) {
                      e.printStackTrace();
                    }
                    return null;
                  })
              .filter(v -> v != null)
              .forEach(v -> value.add(v));
          return value;
        }
        return entry.getValue();
      }

      if (f.getType().isArray()) {
        if (List.class.isAssignableFrom(entry.getValue().getClass())) {
          List l = (List) entry.getValue();
          if (boolean[].class.equals(f.getType())) {
            boolean[] t = new boolean[l.size()];
            for (int i = 0; i < l.size(); i++) {
              Object v = l.get(i);
              boolean tv = false;
              if (v instanceof Boolean) tv = ((Boolean) v).booleanValue();
              t[i] = tv;
            }
            return t;
          }
          if (int[].class.equals(f.getType())) {
            int[] t = new int[l.size()];
            for (int i = 0; i < l.size(); i++) {
              Object v = l.get(i);
              int tv = 0;
              if (v instanceof Integer) tv = ((Integer) v).intValue();
              else if (v instanceof String) tv = Integer.parseInt((String) v);
              t[i] = tv;
            }
            return t;
          }
          if (double[].class.equals(f.getType())) {
            double[] t = new double[l.size()];
            for (int i = 0; i < l.size(); i++) {
              Object v = l.get(i);
              double tv = 0;
              if (v instanceof Double) tv = ((Double) v).doubleValue();
              if (v instanceof Integer) tv = ((Integer) v).doubleValue();
              t[i] = tv;
            }
            return t;
          }
          if (String[].class.equals(f.getType())) {
            return l.toArray(new String[0]);
          }
          if (ExternalReference[].class.equals(f.getType())) {
            List t = new ArrayList();
            for (int i = 0; i < l.size(); i++) {
              Map<String, Object> v = (Map<String, Object>) l.get(i);
              t.add(new ExternalReference(v.get("value"), (String) v.get("key")));
            }
            return t.toArray(new ExternalReference[0]);
          }
          if (f.getType().getComponentType().isEnum()) {
            List t = new ArrayList();
            for (int i = 0; i < l.size(); i++) {
              Object v = l.get(i);
              t.add(Enum.valueOf((Class) f.getType().getComponentType(), (String) v));
            }
            return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
          }
        }
      }
      if (!f.getType().isAssignableFrom(entry.getValue().getClass())) {
        if (fileChecker.isFile(f)) {
          Map<String, Object> value = extractFirstMap(entry.getValue());
          if (value == null) {
            targetValue = null;
          } else {
            Class<?> genericType = f.getType();
            targetValue = toFile(f, genericType, value);
          }
        } else if (ExternalReference.class.isAssignableFrom(f.getType())) {
          Map<String, Object> value = (Map<String, Object>) entry.getValue();
          targetValue = new ExternalReference(value.get("value"), (String) value.get("key"));
        } else if (entry.getValue() instanceof String) {
          targetValue = getActualValue(f.getType(), entry.getValue());
        } else if (entry.getValue() instanceof Map) {
          if (f.getType().isAnnotationPresent(Entity.class)) {
            targetValue = reflectionHelper.newInstance(f.getType());
            Object id = ((Map<String, Object>) entry.getValue()).get("value");
            reflectionHelper.setValue(reflectionHelper.getIdField(f.getType()), targetValue, id);
          } else {
            targetValue = serializer.fromMap((Map<String, Object>) entry.getValue(), f.getType());
          }
        }
      }
    }
    return targetValue;
  }

  private Map<String, Object> extractFirstMap(Object value) {
    if (Map.class.isAssignableFrom(value.getClass())) {
      return (Map<String, Object>) value;
    } else if (List.class.isAssignableFrom(value.getClass())) {
      var list = ((List<Map<String, Object>>) value);
      return list.size() > 0 ? list.get(0) : null;
    }
    return null;
  }

  private Object toFile(FieldInterfaced f, Class<?> genericType, Map<String, Object> value) {
    Object targetValue = null;
    if (String.class.equals(genericType)) {
      try {
        targetValue = storageService.getUrl((String) value.get("id"), (String) value.get("name"));
      } catch (AuthenticationException e) {
        e.printStackTrace();
      }
      // targetValue =  value.get("targetUrl") + "/" + value.get("name");
    } else if (java.io.File.class.equals(genericType)) {
      try {
        targetValue =
            storageService
                .loadAsResource((String) value.get("id"), (String) value.get("name"))
                .getFile();
      } catch (IOException e) {
        e.printStackTrace();
      } catch (AuthenticationException e) {
        e.printStackTrace();
      }
    } else {
      log.warn(
          "field "
              + f.getName()
              + " from "
              + f.getDeclaringClass().getName()
              + " is not valid for a file type");
    }
    return targetValue;
  }
}
