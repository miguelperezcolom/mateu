package io.mateu.core.application.runaction;

import io.mateu.core.domain.ComponentState;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

/**
 * Static helpers for building ServerSideComponentDto and extracting component/state metadata.
 *
 * <p>The state helpers live on the domain side now ({@link ComponentState}) and are kept here as
 * deprecated delegates; {@link #invoke} stays here (see why on it).
 */
public class ComponentStateHelper {

  /**
   * @deprecated use {@link ComponentState#wrap(Component, Object, String, String, String, String,
   *     HttpRequest)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static ServerSideComponentDto wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentState.wrap(
        component, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  /**
   * @deprecated use {@link ComponentState#wrap(List, Object, String, String, String, String,
   *     HttpRequest)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static ServerSideComponentDto wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentState.wrap(
        components, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  /**
   * @deprecated use {@link ComponentState#getState(Object, HttpRequest)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static Object getState(Object modelView, HttpRequest httpRequest) {
    return ComponentState.getState(modelView, httpRequest);
  }

  /**
   * @deprecated use {@link ComponentState#withoutRestricted(Object, HttpRequest)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static Object withoutRestricted(Object instance, HttpRequest httpRequest) {
    return ComponentState.withoutRestricted(instance, httpRequest);
  }

  /**
   * @deprecated use {@link ComponentState#getAppRoute(Object)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static String getAppRoute(Object potentialApp) {
    return ComponentState.getAppRoute(potentialApp);
  }

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
