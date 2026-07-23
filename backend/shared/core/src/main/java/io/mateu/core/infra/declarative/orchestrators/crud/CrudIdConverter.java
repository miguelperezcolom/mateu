package io.mateu.core.infra.declarative.orchestrators.crud;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.UUID;

/**
 * Converts the raw string id coming from a route into the crud's declared {@code IdType}. Backs
 * {@link Crud#toId(String)}'s default implementation so a crud only needs to override {@code toId}
 * when its id type is neither a string (nor a supertype of it), a well-known scalar, nor a type
 * exposing a single-{@code String} public constructor.
 */
final class CrudIdConverter {

  private CrudIdConverter() {}

  @SuppressWarnings({"unchecked", "rawtypes"})
  static Object convert(String id, Class<?> idClass, Class<?> crudClass) {
    if (id == null || idClass == null) {
      return id;
    }
    // String (and any supertype: CharSequence, Object, Comparable, Serializable): identity.
    if (idClass.isInstance(id)) {
      return id;
    }
    try {
      if (idClass == Integer.class) return Integer.valueOf(id);
      if (idClass == Long.class) return Long.valueOf(id);
      if (idClass == Short.class) return Short.valueOf(id);
      if (idClass == Byte.class) return Byte.valueOf(id);
      if (idClass == Double.class) return Double.valueOf(id);
      if (idClass == Float.class) return Float.valueOf(id);
      if (idClass == Boolean.class) return Boolean.valueOf(id);
      if (idClass == BigInteger.class) return new BigInteger(id);
      if (idClass == BigDecimal.class) return new BigDecimal(id);
      if (idClass == UUID.class) return UUID.fromString(id);
      if (idClass == Character.class) {
        if (id.length() != 1) {
          throw new IllegalArgumentException("expected a single character but got \"" + id + "\"");
        }
        return id.charAt(0);
      }
      if (idClass.isEnum()) return Enum.valueOf((Class<? extends Enum>) idClass, id);
    } catch (RuntimeException e) {
      throw new IllegalArgumentException(
          "Cannot convert route id \""
              + id
              + "\" to "
              + idClass.getName()
              + " in "
              + crudClass.getSimpleName()
              + ": "
              + e.getMessage(),
          e);
    }
    // Any type exposing a single-String constructor (public or not) — a value-object id wrapper.
    try {
      var constructor = idClass.getDeclaredConstructor(String.class);
      constructor.setAccessible(true);
      return constructor.newInstance(id);
    } catch (NoSuchMethodException noStringConstructor) {
      // fall through to the failure below
    } catch (ReflectiveOperationException e) {
      throw new IllegalArgumentException(
          "Cannot convert route id \""
              + id
              + "\" to "
              + idClass.getName()
              + " in "
              + crudClass.getSimpleName()
              + " via its String constructor: "
              + e.getMessage(),
          e);
    }
    throw new UnsupportedOperationException(
        crudClass.getSimpleName()
            + " must override toId(String): cannot automatically convert the route id \""
            + id
            + "\" to "
            + idClass.getName()
            + " (not a string, a known scalar, nor a type with a single-String constructor).");
  }
}
