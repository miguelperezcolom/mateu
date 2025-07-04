package io.mateu.core.domain.reflection;

import static io.mateu.core.domain.reflection.AllFieldsProvider.getAllFields;

import java.lang.reflect.Field;

public class FieldByNameProvider {

  public static Field getFieldByName(Class sourceClass, String fieldName) {
    Field field = null;
    String fn = fieldName.split("\\.")[0];
    for (Field f : getAllFields(sourceClass)) {
      if (fn.equals(f.getName())) {
        if (fn.equals(fieldName)) {
          field = f;
        } else {
          field = getFieldByName(f.getType(), fieldName.substring(fn.length() + 1));
        }
        break;
      }
    }
    // if (field == null) log.warn("No field " + fieldName + " at " + sourceClass);
    return field;
  }
}
