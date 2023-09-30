package io.mateu.reflection;

import io.mateu.mdd.shared.SlimHelper;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
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

  public FieldInterfacedForCheckboxColumn(
      String name, FieldInterfaced collectionField, Object value) {
    this.type = boolean.class;
    this.name = name;
    this.collectionField = collectionField;
    this.value = value;
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
    return ReflectionHelper.getGenericClass(type);
  }

  @Override
  public Class<?> getDeclaringClass() {
    return null;
  }

  @Override
  public Type getGenericType() {
    return ReflectionHelper.getGenericClass(type);
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
  public Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return ((Collection) ReflectionHelper.getValue(collectionField, o)).contains(value);
  }

  @Override
  public void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    Collection col = (Collection) ReflectionHelper.getValue(collectionField, o);
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

  public String getCaption() {
    return SlimHelper.capitalize(value.toString());
  }
}
