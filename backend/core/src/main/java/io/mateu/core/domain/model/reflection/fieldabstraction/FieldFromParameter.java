package io.mateu.core.domain.model.reflection.fieldabstraction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class FieldFromParameter implements Field {

  private final Parameter p;
  private final Executable m;

  private List<Annotation> extraAnnotations = new ArrayList<>();

  public FieldFromParameter(FieldFromParameter f, Annotation a) {
    this(f);
    extraAnnotations.add(a);
  }

  public Parameter getParameter() {
    return p;
  }

  public Executable getMethod() {
    return m;
  }

  public FieldFromParameter(FieldFromParameter f) {
    this(f.getMethod(), f.getParameter());
  }

  @Override
  public java.lang.reflect.Field getField() {
    return null;
  }

  @Override
  public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
    return p.getDeclaredAnnotationsByType(annotationClass);
  }

  public FieldFromParameter(Executable m, Parameter f) {
    this.p = f;
    this.m = m;
  }

  @Override
  public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return true;
    }
    if (ManyToOne.class.equals(annotationClass) && p.getType().isAnnotationPresent(Entity.class))
      return true;
    return p.isAnnotationPresent(annotationClass);
  }

  @Override
  public Class<?> getType() {
    return p.getType();
  }

  @Override
  public AnnotatedType getAnnotatedType() {
    return p.getAnnotatedType();
  }

  @Override
  public Class<?> getGenericClass() {
    if (p.getType().isAnnotationPresent(Entity.class)) {
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
    return Map.class;
  }

  @Override
  public Type getGenericType() {
    return getGenericClass();
  }

  @Override
  public String getName() {
    return p.getName();
  }

  @Override
  public String getId() {
    return p.getName();
  }

  @Override
  public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return (T) a;
    }
    return p.getAnnotation(annotationClass);
  }

  @Override
  public Annotation[] getAnnotations() {
    return p.getAnnotations();
  }

  @Override
  public Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    throw new NoSuchMethodException("We cannot get values for parameter fields");
  }

  @Override
  public void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    throw new NoSuchMethodException("We cannot set values for parameter fields");
  }

  @Override
  public int getModifiers() {
    return p.getModifiers();
  }

  @Override
  public Annotation[] getDeclaredAnnotations() {
    return p.getDeclaredAnnotations();
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
    return this == obj
        || (obj != null && getClass().equals(obj.getClass()) && hashCode() == obj.hashCode());
  }
}
