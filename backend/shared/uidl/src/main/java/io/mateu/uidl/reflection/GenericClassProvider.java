package io.mateu.uidl.reflection;

import static io.mateu.uidl.reflection.TypeProvider.getType;

import io.mateu.uidl.annotations.GenericClass;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

public class GenericClassProvider {

  public static Class<?> getGenericClass(Class type) {
    Class<?> gc = null;
    if (type.getGenericInterfaces() != null)
      for (Type gi : type.getGenericInterfaces()) {
        if (gi instanceof ParameterizedType) {
          ParameterizedType pt = (ParameterizedType) gi;
          gc = (Class<?>) pt.getActualTypeArguments()[0];
        } else {
          gc = (Class<?>) gi;
        }
        break;
      }
    return gc;
  }

  public static Class<?> getGenericClass(Method m) {
    Type gi = m.getGenericReturnType();
    Class<?> gc = null;
    if (gi instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) gi;
      gc = (Class<?>) pt.getActualTypeArguments()[0];
    } else {
      gc = (Class<?>) gi;
    }
    return gc;
  }

  public static Class<?> getGenericClass(Type type) {
    Class<?> gc = null;
    if (type instanceof ParameterizedType) {
      ParameterizedType pt = (ParameterizedType) type;
      var actualTypeArgument = pt.getActualTypeArguments()[0];
      if (actualTypeArgument instanceof Class) {
        gc = (Class<?>) actualTypeArgument;
      }
    } else {
      gc = (Class<?>) type;
    }
    return gc;
  }

  public static Class getGenericClass(
      Field field, Class asClassOrInterface, String genericArgumentName) {
    Type t = field.getGenericType();
    if (field.isAnnotationPresent(GenericClass.class))
      return field.getAnnotation(GenericClass.class).clazz();
    else
      return getGenericClass(
          (t instanceof ParameterizedType) ? (ParameterizedType) t : null,
          field.getType(),
          asClassOrInterface,
          genericArgumentName);
  }

  public static Class getGenericClass(
      AnnotatedElement field, Class asClassOrInterface, String genericArgumentName) {
    Type t = getGenericType(field);
    if (field.isAnnotationPresent(GenericClass.class))
      return field.getAnnotation(GenericClass.class).clazz();
    else
      return getGenericClass(
          (t instanceof ParameterizedType) ? (ParameterizedType) t : null,
          getType(field),
          asClassOrInterface,
          genericArgumentName);
  }

  public static Class getGenericClass(
      ParameterizedType parameterizedType, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(
        parameterizedType,
        (Class) parameterizedType.getRawType(),
        asClassOrInterface,
        genericArgumentName);
  }

  public static Class getGenericClass(
      Class sourceClass, Class asClassOrInterface, String genericArgumentName) {
    return getGenericClass(null, sourceClass, asClassOrInterface, genericArgumentName);
  }

  public static Class getGenericClass(
      ParameterizedType parameterizedType,
      Class sourceClass,
      Class asClassOrInterface,
      String genericArgumentName) {
    return GenericTypeHierarchyResolver.resolve(
        parameterizedType, sourceClass, asClassOrInterface, genericArgumentName);
  }

  private static Type getGenericType(AnnotatedElement f) {
    if (f instanceof Field) {
      return ((Field) f).getGenericType();
    } else if (f instanceof Method) {
      return ((Method) f).getGenericReturnType();
    } else {
      return Object.class;
    }
  }
}
