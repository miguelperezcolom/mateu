package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import org.springframework.stereotype.Service;

@Service
public class SetterProvider {

  public String getSetter(Field f) {
    return getSetter(f.getType(), f.getName());
  }

  public String getSetter(Class c, String fieldName) {
    return "set" + getFirstUpper(fieldName);
  }

  private String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }
}
