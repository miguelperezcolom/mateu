package io.mateu.core.domain.reflection;

import java.lang.reflect.Field;

public final class GetterProvider {

  public static String getGetter(Field f) {
    return getGetterByFieldName(f.getType(), f.getName());
  }

  public static String getGetterByFieldName(Class fieldType, String fieldName) {
    return (boolean.class.equals(fieldType) ? "is" : "get") + getFirstUpper(fieldName);
  }

  private static String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }
}
