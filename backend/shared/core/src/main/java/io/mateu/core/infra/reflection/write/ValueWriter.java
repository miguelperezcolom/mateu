package io.mateu.core.infra.reflection.write;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetterByFieldName;
import static io.mateu.core.infra.reflection.read.SetterProvider.getSetter;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ValueWriter {

  public static void setValue(String fn, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
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

  public static void setValue(Field f, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    if (f == null) {
      return;
    }
    try {
      Method setter = o.getClass().getMethod(getSetter(f), f.getType());
      try {
        setter.invoke(o, v);
        //                        BeanUtils.setProperty(o, fn, v);
      } catch (IllegalAccessException | InvocationTargetException e) {
        log.error("when setting initialValue for field " + f.getName(), e);
      }
    } catch (NoSuchMethodException ignored) {
      if (!Modifier.isPublic(f.getModifiers())) {
        f.setAccessible(true);
      }
      try {
          if (v != null && "".equals(v.toString())) {
              if (!String.class.equals(f.getType())) {
                  v = null;
              }
          }
        if (v != null && !"".equals(v.toString())) {
          if (Integer.class.equals(f.getType())) {
            v = Integer.valueOf(v.toString());
          }
          if (Long.class.equals(f.getType())) {
            v = Long.valueOf(v.toString());
          }
          if (Double.class.equals(f.getType())) {
            v = Double.valueOf(v.toString());
          }
          if (BigInteger.class.equals(f.getType())) {
            v = new BigInteger(v.toString());
          }
          if (BigDecimal.class.equals(f.getType())) {
            v = new BigDecimal(v.toString());
          }
            if (java.sql.Date.class.equals(f.getType())) {
                v = new java.sql.Date(LocalDateTime.parse(v.toString()).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
            } else if (Date.class.equals(f.getType())) {
              v = Date.from(LocalDateTime.parse(v.toString()).atZone(ZoneId.systemDefault()).toInstant());
          }
            if (ZonedDateTime.class.equals(f.getType())) {
                v = LocalDateTime.parse(v.toString()).atZone(ZoneId.systemDefault());
            }
        }
        f.set(o, v);
      } catch (Exception ignoredAgain) {
        f.set(o, null);
      }
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
