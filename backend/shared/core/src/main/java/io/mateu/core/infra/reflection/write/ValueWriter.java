package io.mateu.core.infra.reflection.write;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetterByFieldName;
import static io.mateu.core.infra.reflection.read.SetterProvider.getSetter;
import static io.mateu.core.infra.reflection.write.FieldValueConverter.convert;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ValueWriter {

  public static void setValue(String fn, Object o, Object v) throws Exception {
    if (Map.class.isAssignableFrom(o.getClass())) {
      ((Map) o).put(fn, v);
    } else {
      if (fn.contains(".")) {
        o = getInstance(o, fn.substring(0, fn.indexOf(".")));
        setValue(fn.substring(fn.indexOf(".") + 1), o, v);
      } else {
        if (v instanceof Collection) {
          if (v instanceof List) v = new ArrayList((Collection) v);
          else if (v instanceof Set) v = new HashSet((Collection) v);
        }

        Field f = getFieldByName(o.getClass(), fn);

        setValue(f, o, v);
      }
    }
  }

  public static void setValue(Field f, Object o, Object v) throws Exception {
    if (f == null) {
      return;
    }
    v = convert(v, f.getType());
    try {
      Method setter = o.getClass().getMethod(getSetter(f), f.getType());
      try {
        setter.invoke(o, v);
        //                        BeanUtils.setProperty(o, fn, v);
      } catch (IllegalAccessException | InvocationTargetException e) {
        log.error("when setting initialValue for field " + f.getName(), e);
      }
    } catch (NoSuchMethodException ignored) {
      FallbackFieldSetter.set(f, o, v);
    }
  }

  private static Object getInstance(Object o, String fn)
      throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Object x = null;
    if (o != null) {
      if (fn.contains(".")) {
        o = getInstance(o, fn.substring(0, fn.indexOf(".")));
        x = getInstance(o, fn.substring(fn.indexOf(".") + 1));
      } else {
        x = o.getClass().getMethod(getGetterByFieldName(o.getClass(), fn)).invoke(o);
      }
    }
    return x;
  }
}
