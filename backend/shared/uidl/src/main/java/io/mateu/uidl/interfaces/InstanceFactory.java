package io.mateu.uidl.interfaces;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

public interface InstanceFactory {

  <T> T newInstance(Class<T> type)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException;

  <T> T newInstance(Class<T> type, Map<String, Object> data);
}
