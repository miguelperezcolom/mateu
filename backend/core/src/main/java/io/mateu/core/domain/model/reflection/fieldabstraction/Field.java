package io.mateu.core.domain.model.reflection.fieldabstraction;

import java.lang.annotation.Annotation;
import java.lang.reflect.*;

/** Created by miguel on 22/2/17. */
public interface Field extends AnnotatedElement {
  boolean isAnnotationPresent(Class<? extends Annotation> annotationClass);

  Class<?> getType();

  AnnotatedType getAnnotatedType();

  Class<?> getGenericClass();

  Class<?> getDeclaringClass();

  Type getGenericType();

  String getName();

  String getId();

  void setId(String id);

  <T extends Annotation> T getAnnotation(Class<T> annotationClass);

  Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException;

  String toString();

  java.lang.reflect.Field getField();

  <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass);

  void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException;

  int getModifiers();

  Annotation[] getDeclaredAnnotations();
}
