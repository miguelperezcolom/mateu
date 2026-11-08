package io.mateu.core.application.runaction;

import io.mateu.core.domain.ComponentState;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * Static helpers for building ServerSideComponentDto and extracting component/state metadata.
 *
 * <p>The state helpers live on the domain side now ({@link ComponentState}) and are kept here as
 * deprecated delegates; {@link #invoke} stays here (see why on it).
 */
public class ComponentStateHelper {

  /**
   * Invokes {@code method} on {@code instance}, surfacing the exception the method threw rather
   * than the reflective wrapper. Not deprecated and deliberately NOT moved with the rest: a
   * reflective call is access-checked against the CALLER's package, so moving it would change which
   * methods it can call.
   */
  public static Object invoke(Method method, Object instance) {
    try {
      return method.invoke(instance);
    } catch (InvocationTargetException e) {
      // Surface the real exception the method threw, not the reflective wrapper (this is exactly
      // what @SneakyThrows hid behind NoClassDefFoundError: lombok/Lombok when it rethrew).
      var cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException re) {
        throw re;
      }
      if (cause instanceof Error err) {
        throw err;
      }
      throw new RuntimeException(cause);
    } catch (IllegalAccessException e) {
      throw new RuntimeException("Cannot invoke " + method, e);
    }
  }
}
