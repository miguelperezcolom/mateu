package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.JsonSerializer.fromMap;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.CollectionValueConverter.convertArrayValue;
import static io.mateu.core.infra.reflection.read.CollectionValueConverter.convertListValue;
import static io.mateu.core.infra.reflection.read.CollectionValueConverter.extractFirstMap;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.FileChecker.isFile;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ActualValueExtractor {

  private static boolean checkInjected(Object viewInstance, String fieldName) {
    Field field = getFieldByName(viewInstance.getClass(), fieldName);
    return field != null
        && (MetaAnnotations.isPresent(field, Inject.class)
            || Modifier.isFinal(field.getModifiers()));
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
      if (entry.getValue() instanceof Component) return null;
      if (HolderFieldChecker.isNonDataHolder(f)) return null;
      if (List.class.isAssignableFrom(f.getType())) {
        return convertListValue(f, entry.getValue(), instanceFactory, httpRequest);
      }
      if (f.getType().isArray() && List.class.isAssignableFrom(entry.getValue().getClass())) {
        return convertArrayValue(
            f, (java.util.List) entry.getValue(), instanceFactory, httpRequest);
      }
      if (!f.getType().isAssignableFrom(entry.getValue().getClass())) {
        if (isFile(f)) {
          Map<String, Object> value = extractFirstMap(entry.getValue());
          targetValue = value == null ? null : toFile(f, f.getType(), value);
        } else if (entry.getValue() instanceof String) {
          targetValue =
              TypeCoercionHelper.getActualValue(
                  f.getType(), entry.getValue(), instanceFactory, httpRequest);
        } else if (entry.getValue() instanceof Map) {
          targetValue = fromMap((Map<String, Object>) entry.getValue(), f.getType());
        } else if (float.class.equals(f.getType()) || Float.class.equals(f.getType())) {
          if (entry.getValue() instanceof Double doubleValue) {
            targetValue = doubleValue.floatValue();
          }
        } else if (BigDecimal.class.equals(f.getType())) {
          if (entry.getValue() instanceof Double d) targetValue = BigDecimal.valueOf(d);
          else if (entry.getValue() instanceof Integer i) targetValue = BigDecimal.valueOf(i);
          else if (entry.getValue() instanceof Long l) targetValue = BigDecimal.valueOf(l);
          else if (entry.getValue() instanceof Float fl) targetValue = BigDecimal.valueOf(fl);
        }
      }
    }
    return targetValue;
  }

  private static Object toFile(Field f, Class<?> genericType, Map<String, Object> value) {
    return null;
  }
}
