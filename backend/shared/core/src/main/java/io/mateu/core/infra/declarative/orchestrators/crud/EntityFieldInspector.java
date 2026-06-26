package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.PrimaryKey;
import java.lang.reflect.Field;

final class EntityFieldInspector {

  static String getEntityName(Object item) {
    if (item == null) {
      return "No item found";
    }
    Object name = null;
    try {
      name = getValue(getFieldByName(item.getClass(), "name"), item);
      if (name != null) return "" + name;
    } catch (Exception ignored) {
    }
    try {
      name = getValue(getFieldByName(item.getClass(), getIdField(item.getClass())), item);
      if (name != null) return "" + name;
    } catch (Exception ignored) {
    }
    return item.toString();
  }

  static String getIdField(Class<?> entityClass) {
    boolean hasIdField = false;
    String firstField = null;
    for (Field field : getAllFields(entityClass)) {
      if (MetaAnnotations.isPresent(field, PrimaryKey.class)) {
        return field.getName();
      }
      hasIdField |= "id".equals(field.getName());
      if (firstField == null) {
        firstField = field.getName();
      }
    }
    return hasIdField || firstField == null ? "id" : firstField;
  }

  private EntityFieldInspector() {}
}
