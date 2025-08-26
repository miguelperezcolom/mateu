package io.mateu.core.domain.reflection;

import io.mateu.uidl.interfaces.Hydratable;

import static io.mateu.core.domain.reflection.ActualValueExtractor.getActualValue;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

public class Hydrater {

  public static <T> T hydrate(T object, Map<String, Object> data) {
      if (!(object instanceof Hydratable)) {
          if (data != null) {
              data.entrySet()
                      .forEach(
                              entry -> {
                                  try {
                                      Object actualValue = getActualValue(entry, object);
                                      setValue(entry.getKey(), object, actualValue);
                                  } catch (Exception ex) {
                                      System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                                  }
                              });
          }
      }
    return object;
  }

  public static void setValue(String fn, Object o, Object v)
      throws InvocationTargetException, IllegalAccessException, NoSuchMethodException {
    ValueWriter.setValue(fn, o, v);
  }
}
