package io.mateu.core.infra.reflection.write;

import static io.mateu.core.infra.reflection.read.ActualValueExtractor.getActualValue;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import java.lang.reflect.InvocationTargetException;
import java.util.Map;

public class Hydrater {

  public static <T> T hydrate(
      T object,
      Map<String, Object> data,
      InstanceFactory instanceFactory,
      HttpRequest httpRequest) {
    if (!(object instanceof Hydratable)) {
      if (data != null) {
        data.entrySet()
            .forEach(
                entry -> {
                  try {
                    Object actualValue =
                        getActualValue(entry, object, instanceFactory, httpRequest);
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
