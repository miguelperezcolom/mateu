package io.mateu.uidl.interfaces;

import java.util.Map;

public class MateuInstanceFactory {

  // volatile: set by the container thread at startup, read by request threads
  private static volatile InstanceFactory _instanceFactory;

  public static void setInstanceFactory(InstanceFactory instanceFactory) {
    _instanceFactory = instanceFactory;
  }

  public static <T> T newInstance(
      Class<T> type, Map<String, Object> data, HttpRequest httpRequest) {
    if (Map.class.isAssignableFrom(type)) {
      return (T) data;
    }
    var instanceFactory = _instanceFactory;
    if (instanceFactory == null) {
      throw new IllegalStateException(
          "MateuInstanceFactory has not been initialized. Call setInstanceFactory() first.");
    }
    return instanceFactory.newInstance(type, data, httpRequest);
  }
}
