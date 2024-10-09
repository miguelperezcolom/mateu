package io.mateu.core.domain.model.reflection.fieldabstraction;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.uidefinition.shared.annotations.GenericClass;
import java.lang.annotation.Annotation;
import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;

@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class FieldFromReflectionField implements Field {

  private String id;
  private final java.lang.reflect.Field f;
  private final Field ff;

  private final List<Annotation> extraAnnotations = new ArrayList<>();

  public FieldFromReflectionField(Field f, Annotation a) {
    this(f);
    extraAnnotations.add(a);
  }

  @Override
  public java.lang.reflect.Field getField() {
    return f;
  }

  @Override
  public <T extends Annotation> T[] getDeclaredAnnotationsByType(Class<T> annotationClass) {
    return (ff != null)
        ? ff.getDeclaredAnnotationsByType(annotationClass)
        : f.getDeclaredAnnotationsByType(annotationClass);
  }

  public FieldFromReflectionField(Field f) {
    this.ff = f;
    this.f = f.getField();
    id = ff.getId();
  }

  public FieldFromReflectionField(java.lang.reflect.Field f) {
    this.ff = null;
    this.f = f;
    id = f.getName();
  }

  @Override
  public boolean isAnnotationPresent(Class<? extends Annotation> annotationClass) {
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations)
        if (annotationClass.isAssignableFrom(a.getClass())) return true;
    }
    return (ff != null)
        ? ff.isAnnotationPresent(annotationClass)
        : f.isAnnotationPresent(annotationClass);
  }

  @Override
  public Class<?> getType() {
    return (ff != null) ? ff.getType() : f.getType();
  }

  @Override
  public AnnotatedType getAnnotatedType() {
    return (ff != null) ? ff.getAnnotatedType() : f.getAnnotatedType();
  }

  @Override
  public Class<?> getGenericClass() {
    if (ff != null) return ff.getGenericClass();
    else if (f.isAnnotationPresent(GenericClass.class))
      return f.getAnnotation(GenericClass.class).clazz();
    else if (f.getGenericType() != null && f.getGenericType() instanceof ParameterizedType) {

      ParameterizedType genericType = (ParameterizedType) f.getGenericType();
      if (genericType != null && genericType.getActualTypeArguments().length > 0) {
        Type ata0 = genericType.getActualTypeArguments()[0];
        if (ata0 instanceof Class<?>) {
          Class<?> genericClass = (Class<?>) ata0;
          return genericClass;
        } else return null;
      } else return null;

    } else if (f.getGenericType() != null) {
      return (Class<?>) f.getGenericType();
    } else return null;
  }

  @Override
  public Class<?> getDeclaringClass() {
    return (ff != null) ? ff.getDeclaringClass() : f.getDeclaringClass();
  }

  @Override
  public Type getGenericType() {
    return (ff != null) ? ff.getGenericType() : f.getGenericType();
  }

  @Override
  public String getName() {
    return (ff != null) ? ff.getName() : f.getName();
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
    if (extraAnnotations.size() > 0) {
      for (Annotation a : extraAnnotations) if (a.getClass().equals(annotationClass)) return (T) a;
    }
    return (ff != null) ? ff.getAnnotation(annotationClass) : f.getAnnotation(annotationClass);
  }

  @Override
  public Annotation[] getAnnotations() {
    return ff.getAnnotations();
  }

  @Override
  public Object getValue(Object o) throws IllegalAccessException {
    try {
      Method getter = o.getClass().getMethod(getGetter(f), f.getType());
      if (getter != null) {
        return getter.invoke(o);
      }
    } catch (Throwable ignored) {
    }
    if (Map.class.isAssignableFrom(o.getClass())) {
      return ((Map<?, ?>) o).get(f.getName());
    }
    return f.get(o);
  }

  private String getGetter(java.lang.reflect.Field f) {
    return (boolean.class.equals(f.getType()) ? "is" : "get") + getFirstUpper(f.getName());
  }

  private String getFirstUpper(String fieldName) {
    return fieldName.substring(0, 1).toUpperCase() + fieldName.substring(1);
  }

  private String getSetter(java.lang.reflect.Field f) {
    return "set" + getFirstUpper(f.getName());
  }

  @SneakyThrows
  @Override
  public void setValue(Object o, Object v) throws IllegalAccessException {
    try {
      Method setter = o.getClass().getMethod(getSetter(f), f.getType());
      if (setter != null) {
        setter.invoke(o, v);
        //                        BeanUtils.setProperty(o, fn, v);
        return;
      }
    } catch (Throwable ignored) {
    }
    if (Map.class.isAssignableFrom(o.getClass())) {
      ((Map) o).put(f.getName(), v);
      return;
    }
    if (!Modifier.isPublic(f.getModifiers())) f.setAccessible(true);
    f.set(o, v);
  }

  @Override
  public int getModifiers() {
    return f.getModifiers();
  }

  @Override
  public Annotation[] getDeclaredAnnotations() {
    return (ff != null) ? ff.getDeclaredAnnotations() : f.getDeclaredAnnotations();
  }

  @Override
  public String toString() {
    return getName();
  }

  @Override
  public int hashCode() {
    return ("" + getField().getDeclaringClass().getName() + "/" + getField().getName() + "")
        .hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    return this == obj
        || (obj != null && getClass().equals(obj.getClass()) && hashCode() == obj.hashCode());
  }
}
