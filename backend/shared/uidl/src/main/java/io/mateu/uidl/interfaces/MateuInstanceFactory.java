package io.mateu.uidl.interfaces;

import java.util.Map;

public class MateuInstanceFactory {

  private static InstanceFactory _instanceFactory;

  public static void setInstanceFactory(InstanceFactory instanceFactory) {
    _instanceFactory = instanceFactory;
  }

  public static <T> T newInstance(
      Class<T> type, Map<String, Object> data, HttpRequest httpRequest) {
    if (Map.class.isAssignableFrom(type)) {
      return (T) data;
    }
    if (_instanceFactory == null) {
      throw new IllegalStateException(
          "MateuInstanceFactory has not been initialized. Call setInstanceFactory() first.");
    }
    return _instanceFactory.newInstance(type, data, httpRequest);
  }
}
