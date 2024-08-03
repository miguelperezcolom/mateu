package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import org.springframework.stereotype.Service;

@Service
public class GetterProvider {

  public String getGetter(java.lang.reflect.Field f) {
    return getGetter(f.getType(), f.getName());
  }

  public String getGetter(Field f) {
    return getGetter(f.getType(), f.getName());
  }

  public String getGetter(Class c, String fieldName) {
    return (boolean.class.equals(c) ? "is" : "get") + getFirstUpper(fieldName);
  }

  public String getGetter(String fn) {
    return "get" + getFirstUpper(fn);
  }

  private String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }
}
