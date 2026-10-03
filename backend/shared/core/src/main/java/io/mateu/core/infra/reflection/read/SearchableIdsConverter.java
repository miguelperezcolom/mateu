package io.mateu.core.infra.reflection.read;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Binds the ids of a multi-valued {@code @Searchable} field — a {@code List}, {@code Set} or array
 * of ids — from the JSON list the browser sends: each id is coerced to the element type (JSON
 * numbers and strings into {@code Long}/{@code Integer}, strings into {@code UUID}…), and the
 * collection gets the field's shape (a {@code Set} keeps the first occurrence of each id, in
 * order).
 */
final class SearchableIdsConverter {

  private SearchableIdsConverter() {}

  static boolean applies(Field field, Object rawValue) {
    return rawValue instanceof Collection<?>
        && MetaAnnotations.isPresent(field, Searchable.class)
        && (Collection.class.isAssignableFrom(field.getType()) || field.getType().isArray());
  }

  static Object convert(
      Field field, Collection<?> rawValue, InstanceFactory instanceFactory, HttpRequest httpRequest)
      throws Exception {
    var type = field.getType();
    Class<?> elementType =
        type.isArray() ? type.getComponentType() : getGenericClass(field.getGenericType());
    if (elementType == null) {
      elementType = Object.class;
    }
    var ids = new ArrayList<Object>();
    for (var raw : rawValue) {
      if (raw == null || (raw instanceof String string && string.isBlank())) {
        continue;
      }
      ids.add(
          Object.class.equals(elementType) || elementType.isInstance(raw)
              ? raw
              : TypeCoercionHelper.getActualValue(elementType, raw, instanceFactory, httpRequest));
    }
    if (type.isArray()) {
      var array = Array.newInstance(elementType, ids.size());
      for (int i = 0; i < ids.size(); i++) {
        Array.set(array, i, ids.get(i));
      }
      return array;
    }
    if (Set.class.isAssignableFrom(type)) {
      return new LinkedHashSet<>(ids);
    }
    return (List<Object>) ids;
  }
}
