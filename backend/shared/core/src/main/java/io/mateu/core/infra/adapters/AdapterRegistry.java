package io.mateu.core.infra.adapters;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.ComponentAdapter;

/** Looks up the registered {@link ComponentAdapter} (a bean) for a given domain type. */
public final class AdapterRegistry {

  private AdapterRegistry() {}

  @SuppressWarnings("rawtypes")
  public static ComponentAdapter find(Class<?> type) {
    if (type == null) {
      return null;
    }
    try {
      for (ComponentAdapter adapter : MateuBeanProvider.getBeans(ComponentAdapter.class)) {
        var adapted = adapter.type();
        if (adapted != null && adapted.isAssignableFrom(type)) {
          return adapter;
        }
      }
    } catch (Exception ignore) {
      // no bean provider / no adapters
    }
    return null;
  }

  @SuppressWarnings("rawtypes")
  public static ComponentAdapter findByTypeName(String className) {
    if (className == null) {
      return null;
    }
    try {
      for (ComponentAdapter adapter : MateuBeanProvider.getBeans(ComponentAdapter.class)) {
        var adapted = adapter.type();
        if (adapted != null && adapted.getName().equals(className)) {
          return adapter;
        }
      }
    } catch (Exception ignore) {
      // no bean provider / no adapters
    }
    return null;
  }
}
