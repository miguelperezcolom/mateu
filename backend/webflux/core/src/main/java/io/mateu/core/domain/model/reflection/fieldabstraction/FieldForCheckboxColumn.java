package io.mateu.core.domain.model.reflection.fieldabstraction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedType;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;
import java.util.Collection;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class FieldForCheckboxColumn implements Field {

  @ManyToOne private final Class type;
  String id;
  private final String name;
  private final Field collectionField;
  private final Object value;

  private final ReflectionService reflectionService;

  public FieldForCheckboxColumn(
      String name, Field collectionField, Object value, ReflectionService reflectionService) {
    this.type = boolean.class;
    this.id = name;
    this.name = name;
    this.collectionField = collectionField;
    this.value = value;
    this.reflectionService = reflectionService;
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
    return reflectionService.getGenericClass(type);
  }

  @Override
  public Class<?> getDeclaringClass() {
    return null;
  }

  @Override
  public Type getGenericType() {
    return reflectionService.getGenericClass(type);
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
  public Object getValue(Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {
    return ((Collection) reflectionService.getValue(collectionField, o)).contains(value);
  }

  @Override
  public void setValue(Object o, Object v)
      throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
    Collection col = (Collection) reflectionService.getValue(collectionField, o);
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
    return this == obj
        || (obj != null && getClass().equals(obj.getClass()) && hashCode() == obj.hashCode());
  }

  public String getValueForColumn() {
    return value.toString();
  }
}
