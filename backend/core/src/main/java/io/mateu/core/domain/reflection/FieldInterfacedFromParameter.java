package io.mateu.core.domain.reflection;

import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FieldInterfacedFromParameter implements FieldInterfaced {

  private final Parameter p;
  private final Executable m;
  private final FieldInterfacedFromParameter ff;

  private final ReflectionHelper reflectionHelper;

  private List<Annotation> extraAnnotations = new ArrayList<>();

  public FieldInterfacedFromParameter(
      FieldInterfacedFromParameter f, Annotation a, ReflectionHelper reflectionHelper) {
    this(f, reflectionHelper);
    extraAnnotations.add(a);
  }

  public Parameter getParameter() {
    return p;
  }

  public Executable getMethod() {
    return m;
  }

  public FieldInterfacedFromParameter(
      FieldInterfacedFromParameter f, ReflectionHelper reflectionHelper) {
    this(f.getMethod(), f.getParameter(), reflectionHelper);
  }

  @Override
  public Field getField() {
    return null;
  }

  @Override
  public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
    return (ff != null)
        ? ff.getDeclaredAnnotationsByType(annotationClass)
        : p.getDeclaredAnnotationsByType(annotationClass);
  }

  public FieldInterfacedFromParameter(
      Executable m, Parameter f, ReflectionHelper reflectionHelper) {
    this.ff = null;
    this.p = f;
    this.m = m;
    this.reflectionHelper = reflectionHelper;
  }

  @Override
  public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return true;
    }
    if (ManyToOne.class.equals(annotationClass) && p.getType().isAnnotationPresent(Entity.class))
      return true;
    return (ff != null)
        ? ff.isAnnotationPresent(annotationClass)
        : p.isAnnotationPresent(annotationClass);
  }

  @Override
  public Class<?> getType() {
    return (ff != null) ? ff.getType() : p.getType();
  }

  @Override
  public AnnotatedType getAnnotatedType() {
    return (ff != null) ? ff.getAnnotatedType() : p.getAnnotatedType();
  }

  @Override
  public Class<?> getGenericClass() {
    if (ff != null) return ff.getGenericClass();
    else if (p.getType().isAnnotationPresent(Entity.class)) {
      return p.getType();
    } else if (p.getParameterizedType() != null) {
      ParameterizedType genericType = null;
      Type aux = p.getAnnotatedType().getType();
      if (aux instanceof ParameterizedType) genericType = (ParameterizedType) aux;
      else if (p.getParameterizedType() != null
          && p.getParameterizedType() instanceof ParameterizedType)
        genericType = (ParameterizedType) p.getParameterizedType();
      if (genericType != null && genericType.getActualTypeArguments().length > 0) {
        Class<?> genericClass = (Class<?>) genericType.getActualTypeArguments()[0];
        return genericClass;
      } else return null;

    } else return null;
  }

  @Override
  public Class<?> getDeclaringClass() {
    return (ff != null) ? ff.getDeclaringClass() : Map.class;
  }

  @Override
  public Type getGenericType() {
    return (ff != null) ? ff.getGenericType() : getGenericClass();
  }

  @Override
  public String getName() {
    return (ff != null) ? ff.getName() : p.getName();
  }

  @Override
  public String getId() {
    return (ff != null) ? ff.getId() : p.getName();
  }

  @Override
  public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return (T) a;
    }
    return (ff != null) ? ff.getAnnotation(annotationClass) : p.getAnnotation(annotationClass);
  }

  @Override
  public Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return reflectionHelper.getValue(this, o);
  }

  @Override
  public void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    reflectionHelper.setValue(this, o, v);
  }

  @Override
  public int getModifiers() {
    return p.getModifiers();
  }

  @Override
  public Annotation[] getDeclaredAnnotations() {
    return (ff != null) ? ff.getDeclaredAnnotations() : p.getDeclaredAnnotations();
  }

  @Override
  public String toString() {
    return getName();
  }

  @Override
  public int hashCode() {
    return ("" + getMethod().getDeclaringClass().getName() + "/" + getParameter().getName() + "")
        .hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    return this == obj || (obj != null && hashCode() == obj.hashCode());
  }
}
