package io.mateu.core.domain;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;

/**
 * {@code httpRequest} as it is, except that it carries {@code rq} as its action request — what a
 * guard narrowed (a listing search's bounded page, a save's writable state) is what the code it
 * hands the request to reads, through {@code runActionRq()} and through every default method built
 * on it ({@code getComponentState}, {@code getInt}, {@code getInitiatorState}…). The adapters keep
 * the request they were built with in a field, so storing a new one as an attribute would not do.
 */
public final class RequestOverride {

  private RequestOverride() {}

  /** {@code rq} with another component state and parameters (null keeps the request's own). */
  public static RunActionRqDto copy(
      RunActionRqDto rq,
      java.util.Map<String, Object> componentState,
      java.util.Map<String, Object> parameters) {
    return new RunActionRqDto(
        componentState != null ? componentState : rq.componentState(),
        rq.appState(),
        parameters != null ? parameters : rq.parameters(),
        rq.initiatorComponentId(),
        rq.consumedRoute(),
        rq.actionId(),
        rq.route(),
        rq.serverSideType(),
        rq.serverSideComponentRoute(),
        rq.knownStructureHash(),
        rq.embeddedChrome());
  }

  public static HttpRequest withRunActionRq(HttpRequest httpRequest, RunActionRqDto rq) {
    if (httpRequest == null || rq == null) {
      return httpRequest;
    }
    InvocationHandler handler =
        (proxy, method, args) -> {
          if ("runActionRq".equals(method.getName()) && method.getParameterCount() == 0) {
            return rq;
          }
          if (method.isDefault() && !overriddenBy(httpRequest, method)) {
            // default methods read runActionRq() through the proxy, so they see the override; one
            // the adapter implements itself (its principal, its address…) stays the adapter's
            return InvocationHandler.invokeDefault(proxy, method, args);
          }
          try {
            return method.invoke(httpRequest, args);
          } catch (InvocationTargetException e) {
            throw e.getCause();
          }
        };
    return (HttpRequest)
        Proxy.newProxyInstance(
            HttpRequest.class.getClassLoader(), new Class<?>[] {HttpRequest.class}, handler);
  }

  private static boolean overriddenBy(HttpRequest httpRequest, java.lang.reflect.Method method) {
    try {
      return httpRequest
              .getClass()
              .getMethod(method.getName(), method.getParameterTypes())
              .getDeclaringClass()
          != method.getDeclaringClass();
    } catch (NoSuchMethodException e) {
      return false;
    }
  }
}
