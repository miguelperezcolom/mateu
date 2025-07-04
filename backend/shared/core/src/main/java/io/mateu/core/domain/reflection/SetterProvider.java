package io.mateu.core.domain.reflection;

import java.lang.reflect.Field;

public class SetterProvider {

  public static String getSetter(Field f) {
    return getSetter(f.getType(), f.getName());
  }

  public static String getSetter(Class c, String fieldName) {
    return "set" + getFirstUpper(fieldName);
  }

  private static String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }
}
