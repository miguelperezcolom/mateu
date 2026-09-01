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
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
      return absentCollectionAsEmpty(f);
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

  /**
   * What a collection field should hold when the browser sent nothing for it: an empty one.
   *
   * <p>A scalar can be absent — a user clearing a date means "no date", and null carries that
   * faithfully (see ClearedFieldsHydrationTest). A collection cannot: the browser offers no way to
   * say "no list" as distinct from "an empty list", because a grid with no rows and a lookup with
   * nothing picked are the same thing on screen. Null there is transport noise, and leaving it to
   * travel makes every consumer of the hydrated object responsible for a state the UI cannot even
   * produce — which is how creating a record without adding a row became a NullPointerException on
   * {@code values.stream()} several layers below the form.
   *
   * <p>Holder fields are left alone. They never round-trip as data, so their entry is always null,
   * and writing anything back would destroy the initializer that is the whole point of them. The
   * Hydrater already drops them before this is reached; the check is repeated because this method
   * is reachable from elsewhere and the cost of being wrong here is silent.
   */
  private static Object absentCollectionAsEmpty(Field f) {
    if (HolderFieldChecker.isNonDataHolder(f)) {
      return null;
    }
    var type = f.getType();
    if (Set.class.isAssignableFrom(type)) {
      return new LinkedHashSet<>();
    }
    if (Collection.class.isAssignableFrom(type)) {
      // Also the answer for a bare Collection: a List is the shape everything downstream expects.
      return new ArrayList<>();
    }
    return null;
  }

  private static Object toFile(Field f, Class<?> genericType, Map<String, Object> value) {
    return null;
  }
}
