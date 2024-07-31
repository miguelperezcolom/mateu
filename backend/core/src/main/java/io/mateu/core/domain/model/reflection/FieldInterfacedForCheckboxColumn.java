package io.mateu.core.domain.model.reflection;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;
import java.util.Collection;

public class FieldInterfacedForCheckboxColumn implements FieldInterfaced {

  @ManyToOne private final Class type;
  private final String name;
  private final FieldInterfaced collectionField;
  private final Object value;

  private final ReflectionHelper reflectionHelper;

  public FieldInterfacedForCheckboxColumn(
      String name,
      FieldInterfaced collectionField,
      Object value,
      ReflectionHelper reflectionHelper) {
    this.type = boolean.class;
    this.name = name;
    this.collectionField = collectionField;
    this.value = value;
    this.reflectionHelper = reflectionHelper;
  }

  @Override
  public Field getField() {
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
    return getName();
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
  public Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return ((Collection) reflectionHelper.getValue(collectionField, o)).contains(value);
  }

  @Override
  public void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    Collection col = (Collection) reflectionHelper.getValue(collectionField, o);
    if (((Boolean) v)) {
      if (!col.contains(value)) col.add(value);
    }
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
    return this == obj || (obj != null && hashCode() == obj.hashCode());
  }

  public String getValueForColumn() {
    return value.toString();
  }
}
