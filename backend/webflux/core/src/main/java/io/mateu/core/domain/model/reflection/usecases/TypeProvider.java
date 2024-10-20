package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import org.springframework.stereotype.Service;

@Service
public class TypeProvider {

  public Class getType(AnnotatedElement f) {
    if (f instanceof Field) {
      return ((Field) f).getType();
    } else if (f instanceof Method) {
      return ((Method) f).getReturnType();
    } else {
      return null;
    }
  }
}
