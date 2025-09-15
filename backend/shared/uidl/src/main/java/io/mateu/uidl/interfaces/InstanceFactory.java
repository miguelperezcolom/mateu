package io.mateu.uidl.interfaces;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

public interface InstanceFactory {

  <T> T newInstance(Class<T> type, HttpRequest httpRequest)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException;

  <T> T newInstance(Class<T> type, Map<String, Object> data, HttpRequest httpRequest);
}
