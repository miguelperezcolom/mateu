package io.mateu.uidl.interfaces;

import java.util.Map;

public class MateuInstanceFactory {

  private static InstanceFactory _instanceFactory;

  public static void setInstanceFactory(InstanceFactory instanceFactory) {
    _instanceFactory = instanceFactory;
  }

  public static <T> T newInstance(Class<T> type, Map<String, Object> data) {
    return _instanceFactory.newInstance(type, data);
  }
}
