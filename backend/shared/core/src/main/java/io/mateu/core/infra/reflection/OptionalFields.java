package io.mateu.core.infra.reflection;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.WildcardType;
import java.util.Optional;

/**
 * An {@code Optional<X>} field is a field of type X: rendered with X's widget, its content on the
 * wire (null when empty — the state serializer's Jdk8 module) and what comes back wrapped again by
 * the writer ({@link #wrap}).
 */
public final class OptionalFields {

  private OptionalFields() {}

  public static boolean isOptional(Field field) {
    return field != null && Optional.class.equals(field.getType());
  }

  /** X for an {@code Optional<X>} field (String when X cannot be resolved), else the field type. */
  public static Class<?> valueType(Field field) {
    if (!isOptional(field)) {
      return field.getType();
    }
    if (field.getGenericType() instanceof ParameterizedType parameterized) {
      var argument = parameterized.getActualTypeArguments()[0];
      if (argument instanceof WildcardType wildcard && wildcard.getUpperBounds().length > 0) {
        argument = wildcard.getUpperBounds()[0];
      }
      if (argument instanceof Class<?> c) {
        return c;
      }
      if (argument instanceof ParameterizedType nested
          && nested.getRawType() instanceof Class<?> c) {
        return c;
      }
    }
    return String.class;
  }

  /**
   * The value an {@code Optional<X>} field takes: already an Optional, or wrapped (empty = null).
   */
  public static Optional<?> wrap(Object value) {
    if (value instanceof Optional<?> optional) {
      return optional;
    }
    return Optional.ofNullable(value);
  }
}
