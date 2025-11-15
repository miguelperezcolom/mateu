package io.mateu.core.infra.reflection.read;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;

import io.mateu.core.domain.ports.BeanProvider;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ValueProvider {

  @SneakyThrows
  public static Object getValueOrNewInstance(BeanProvider beanProvider, Field f, Object o) {
    var value = getValue(f, o);
    if (value == null) {
      value = beanProvider.getBean(f.getType());
    }
    if (value == null) {
      var constructor = f.getType().getDeclaredConstructor();
      if (!Modifier.isPublic(constructor.getModifiers())) constructor.setAccessible(true);
      return constructor.newInstance();
    }
    return value;
  }

  @SneakyThrows
  public static Object getValueOrNewInstance(Field f, Object o) {
    var value = getValue(f, o);
    if (value == null) {
      var constructor = f.getType().getDeclaredConstructor();
      if (!Modifier.isPublic(constructor.getModifiers())) constructor.setAccessible(true);
      return constructor.newInstance();
    }
    return value;
  }

  public static Object getValue(Field f, Object o) {
    if (o == null) return null;
    if (f == null) {
      return null;
    }
    if (Map.class.isAssignableFrom(o.getClass())) {
      return ((Map) o).get(f.getName());
    }

    Method getter = null;
    try {
      getter = o.getClass().getMethod(getGetter(f));
    } catch (Exception ignored) {

    }
    Object v = null;
    try {
      if (getter != null) v = getter.invoke(o);
      else {
        if (!Modifier.isPublic(f.getModifiers())) f.setAccessible(true);
        v = f.get(o);
      }
    } catch (IllegalAccessException | InvocationTargetException e) {
      log.error("when getting initialValue for field " + f.getName(), e);
    }
    return v;
  }

  public static Object getValue(Field f, Object o, Object valueIfNull) {
    if (o == null) return valueIfNull;
    Object v = getValue(f, o);
    return v != null ? v : valueIfNull;
  }

  public static Object getValue(AnnotatedElement e, Object o)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    if (e instanceof Field f) {
      if (Map.class.isAssignableFrom(o.getClass())) {
        return ((Map<?, ?>) o).get(f.getName());
      } else {
        return getValue(f.getName(), o);
      }
    } else if (e instanceof Method m) {
      return m.invoke(o);
    } else {
      return null;
    }
  }

  public static Object getValue(String id, Object o)
      throws IllegalAccessException, InvocationTargetException {

    if (o == null) return null;

    Object v = null;

    if (id.contains(".")) {
      String firstId = id.substring(0, id.indexOf("."));
      String path = id.substring(id.indexOf(".") + 1);

      Method getter = null;
      Field f = getFieldByName(o.getClass(), firstId);

      if (f != null) {

        try {
          getter = o.getClass().getMethod(getGetter(f));
          if (getter != null && getter.getReturnType().isAssignableFrom(f.getType())) {
            getter = null;
          }
          if (getter != null) {
            if (!Modifier.isPublic(getter.getModifiers())) {
              getter.setAccessible(true);
            }
          }
        } catch (Exception e) {

        }

        if (getter != null) v = getter.invoke(o);

        if (v != null) {
          v = getValue(path, v);
        }
      }

    } else {
      Field f = getFieldByName(o.getClass(), id);

      if (f != null) {

        Method getter = null;
        try {
          getter = o.getClass().getMethod(getGetter(f));
          if (getter != null && getter.getReturnType().isAssignableFrom(f.getType())) {
            getter = null;
          }
          if (getter != null) {
            if (!Modifier.isPublic(getter.getModifiers())) {
              getter.setAccessible(true);
            }
          }
        } catch (Exception e) {

        }
        try {
          if (getter != null) v = getter.invoke(o);
        } catch (IllegalAccessException e) {
          e.printStackTrace();
        } catch (InvocationTargetException e) {
          e.printStackTrace();
        }
      }
    }

    return v;
  }
}
