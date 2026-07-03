package io.mateu.uidl.interfaces;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

/**
 * SPI for constructing instances of a given type, optionally seeding their state from a raw {@code
 * Map} of submitted values. Register an implementation as a bean to customise how Mateu builds a
 * particular type (the winning factory is chosen by priority); {@link #newInstance(Class,
 * HttpRequest)} builds a fresh instance and {@link #newInstance(Class, Map, HttpRequest)} builds
 * one hydrated from {@code data}.
 */
public interface InstanceFactory {

  <T> T newInstance(Class<T> type, HttpRequest httpRequest)
      throws InvocationTargetException,
          NoSuchMethodException,
          IllegalAccessException,
          InstantiationException;

  <T> T newInstance(Class<T> type, Map<String, Object> data, HttpRequest httpRequest);
}
