package io.mateu.springdata;

import java.lang.reflect.Field;
import java.util.Optional;

/** The little reflection the store needs before a query exists (no metamodel at hand yet). */
final class Reflection {

  private Reflection() {}

  /**
   * Baseline instance for the difference-from-default check of the example filters: the no-arg
   * constructor, or — for records — the canonical constructor fed null/zero/false. Null when
   * neither works (then only null means "unset"). Same rule as the default {@code CrudStore.find}.
   */
  static Object defaultsInstance(Class<?> type) {
    try {
      if (type.isRecord()) {
        var components = type.getRecordComponents();
        var argTypes = new Class<?>[components.length];
        var args = new Object[components.length];
        for (int i = 0; i < components.length; i++) {
          argTypes[i] = components[i].getType();
          args[i] = primitiveDefault(argTypes[i]);
        }
        var canonical = type.getDeclaredConstructor(argTypes);
        canonical.setAccessible(true);
        return canonical.newInstance(args);
      }
      var constructor = type.getDeclaredConstructor();
      constructor.setAccessible(true);
      return constructor.newInstance();
    } catch (ReflectiveOperationException | RuntimeException ignored) {
      return null;
    }
  }

  private static Object primitiveDefault(Class<?> type) {
    if (!type.isPrimitive()) return null;
    if (type == boolean.class) return false;
    if (type == char.class) return '\0';
    if (type == byte.class) return (byte) 0;
    if (type == short.class) return (short) 0;
    if (type == int.class) return 0;
    if (type == long.class) return 0L;
    if (type == float.class) return 0f;
    return 0d;
  }

  static boolean isBasic(Object value) {
    return value instanceof String
        || value instanceof Number
        || value instanceof Boolean
        || value instanceof Character
        || value.getClass().isEnum();
  }

  /** Whether {@code a.b.c} names a chain of declared fields from {@code type}. */
  static boolean hasPath(Class<?> type, String dotted) {
    Class<?> current = type;
    for (String segment : dotted.split("\\.")) {
      Field field = field(current, segment);
      if (field == null) {
        return false;
      }
      current = field.getType();
    }
    return true;
  }

  /** The name of the field carrying JPA's {@code @Id} / {@code @EmbeddedId}. */
  static Optional<String> idAttribute(Class<?> type) {
    for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      for (Field field : c.getDeclaredFields()) {
        if (field.isAnnotationPresent(jakarta.persistence.Id.class)
            || field.isAnnotationPresent(jakarta.persistence.EmbeddedId.class)) {
          return Optional.of(field.getName());
        }
      }
    }
    return Optional.empty();
  }

  private static Field field(Class<?> type, String name) {
    for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      try {
        return c.getDeclaredField(name);
      } catch (NoSuchFieldException ignored) {
        // walk up
      }
    }
    return null;
  }
}
