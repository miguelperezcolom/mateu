package io.mateu.core.domain.model.reflection.fieldabstraction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class FieldFromType implements Field {

  @ManyToOne private final Class type;
  private final String name;
  private String id;
  private final ReflectionHelper reflectionHelper;

  public FieldFromType(Class type, String name, ReflectionHelper reflectionHelper) {
    this.type = type;
    this.name = name;
    this.id = name;
    this.reflectionHelper = reflectionHelper;
  }

  @Override
  public java.lang.reflect.Field getField() {
    return null;
  }

  @Override
  public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
    return null;
  }

  @Override
  public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
    return (ManyToOne.class.equals(annotationClass) && type.isAnnotationPresent(Entity.class))
        ? true
        : false;
  }

  @Override
  public Class<?> getType() {
    return type;
  }

  @Override
  public AnnotatedType getAnnotatedType() {
    return new AnnotatedType() {
      @Override
      public Type getType() {
        return type;
      }

      @Override
      public <T extends Annotation> T getAnnotation(Class<T> aClass) {
        return null;
      }

      @Override
      public Annotation[] getAnnotations() {
        return new Annotation[0];
      }

      @Override
      public Annotation[] getDeclaredAnnotations() {
        return new Annotation[0];
      }
    };
  }

  @Override
  public Class<?> getGenericClass() {
    return reflectionHelper.getGenericClass(type);
  }

  @Override
  public Class<?> getDeclaringClass() {
    return null;
  }

  @Override
  public Type getGenericType() {
    return reflectionHelper.getGenericClass(type);
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public String getId() {
    return id;
  }

  @Override
  public void setId(String id) {
    this.id = id;
  }

  @Override
  public <T extends Annotation> T getAnnotation(Class<T> annotationClass) {
    return (ManyToOne.class.equals(annotationClass) && type.isAnnotationPresent(Entity.class))
        ? (T) type.getAnnotation(ManyToOne.class)
        : null;
  }

  @Override
  public Annotation[] getAnnotations() {
    return type.getAnnotations();
  }

  @Override
  public <T extends Annotation> T[] getAnnotationsByType(Class<T> annotationClass) {
    return Field.super.getAnnotationsByType(annotationClass);
  }

  @Override
  public <T extends Annotation> T getDeclaredAnnotation(Class<T> annotationClass) {
    return Field.super.getDeclaredAnnotation(annotationClass);
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
    return 0;
  }

  @Override
  public Annotation[] getDeclaredAnnotations() {
    return new Annotation[0];
  }

  @Override
  public String toString() {
    return getName();
  }

  @Override
  public int hashCode() {
    return (getName()).hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    return this == obj
        || (obj != null && getClass().equals(obj.getClass()) && hashCode() == obj.hashCode());
  }
}
