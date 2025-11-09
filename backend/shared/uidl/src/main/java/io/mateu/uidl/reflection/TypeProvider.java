package io.mateu.uidl.reflection;

import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class TypeProvider {

  public static Class getType(AnnotatedElement f) {
    if (f instanceof Field) {
      return ((Field) f).getType();
    } else if (f instanceof Method) {
      return ((Method) f).getReturnType();
    } else {
      return null;
    }
  }
}
