package io.mateu.core.domain.uidefinition.shared.reflection;

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;

/** Created by miguel on 22/2/17. */
public interface FieldInterfaced {
  boolean isAnnotationPresent(Class<? extends Annotation> annotationClass);

  Class<?> getType();

  AnnotatedType getAnnotatedType();

  Class<?> getGenericClass();

  Class<?> getDeclaringClass();

  Type getGenericType();

  String getName();

  String getId();

  <T extends Annotation> T getAnnotation(Class<T> annotationClass);

  Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException;

  String toString();

  Field getField();

  <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass);

  void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException;

  int getModifiers();

  Annotation[] getDeclaredAnnotations();
}
