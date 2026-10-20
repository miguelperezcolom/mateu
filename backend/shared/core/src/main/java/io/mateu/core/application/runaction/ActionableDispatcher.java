package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.ComponentStateHelper.invoke;
import static io.mateu.core.domain.ComponentState.setResolvedRoute;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.MethodProvider.getMethod;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
import reactor.core.publisher.Mono;

final class ActionableDispatcher {

  static Mono<?> dispatch(
      Actionable actionable,
      RunActionCommand command,
      String route,
      boolean emptyIfRoute,
      Function<RunActionCommand, Mono<?>> findRouteResolverFn,
      InstanceFactoryProvider instanceFactoryProvider,
      BeanProvider beanProvider) {
    var httpRequest = command.httpRequest();
    var data = command.componentState();

    if (actionable instanceof RouteLink routeLink) {
      if (emptyIfRoute) return Mono.empty();
      var target = targetOf(routeLink, command);
      if (target == null || target.equals(command.route())) {
        return findRouteResolverFn.apply(command.withConsumedRoute(route));
      }
      // resolved as a route of its own: from what the request had consumed, not from the entry
      return findRouteResolverFn.apply(command.withRoute(target));
    }
    if (actionable instanceof ContentLink contentLink) {
      return Mono.just(contentLink.componentSupplier().component(httpRequest));
    }
    if (actionable instanceof FieldLink fieldLink) {
      setResolvedRoute(httpRequest, route);
      return instanceFactoryProvider
          .get(fieldLink.serverSideType())
          .createInstance(fieldLink.serverSideType(), data, httpRequest)
          .flatMap(
              object -> {
                var field = getFieldByName(object.getClass(), fieldLink.fieldName());
                // through the instance factory, like any view Mateu creates: a bean if there is
                // one, else a new instance WITH its @Autowired/@Inject fields filled — the bare
                // constructor left a Dashboard's services null while it built its content
                return Mono.just(getValueOrNewInstance(field, object, httpRequest));
              })
          .map(object -> invokeIfCallable(object, httpRequest))
          .map(object -> postHydrateIfNeeded(object, httpRequest));
    }
    if (actionable instanceof MethodLink methodLink) {
      setResolvedRoute(httpRequest, route);
      return instanceFactoryProvider
          .get(methodLink.serverSideType())
          .createInstance(methodLink.serverSideType(), data, httpRequest)
          .flatMap(
              object -> {
                var method = getMethod(object.getClass(), methodLink.methodName());
                return Mono.fromCallable(() -> invoke(method, object));
              })
          .map(object -> postHydrateIfNeeded(object, httpRequest));
    }
    if (actionable instanceof Menu) {
      return Mono.just(new Text("Es un menu"));
    }
    return Mono.empty();
  }

  /**
   * Where a route entry goes: the route it names ({@code @Menu String other = "/e2-demo/other"}),
   * not the menu path it is reached by ({@code /other}, from the field name) — those only coincided
   * while the field was called like the route's last segment, and any other name answered "Not
   * found". Whatever the request carries below the entry (a record: {@code /orders/5} under {@code
   * /orders}) is kept. A route naming the mount it is served from ({@code /e2-demo/...} to the
   * {@code /e2-demo} controller) is read relative to it, as every route inside a mount is. The
   * request's own route is kept when the entry names no in-app route (blank, or an external URL),
   * or when it is not known which part of the request the entry consumed.
   */
  static String targetOf(RouteLink routeLink, RunActionCommand command) {
    var route = command.route();
    var target = routeLink.route();
    if (route == null || target == null || !target.startsWith("/") || target.startsWith("//")) {
      return route;
    }
    var entryPath =
        command.httpRequest() != null
            ? (String) command.httpRequest().getAttribute("resolvedPath")
            : null;
    if (entryPath == null || entryPath.isEmpty() || !route.startsWith(entryPath)) {
      return route;
    }
    var rest = route.substring(entryPath.length());
    if (!rest.isEmpty() && !rest.startsWith("/") && !rest.startsWith("?")) {
      return route;
    }
    return relativeToMount(target, command.baseUrl()) + rest;
  }

  private static String relativeToMount(String target, String baseUrl) {
    if (baseUrl == null || baseUrl.contains("://")) {
      return target;
    }
    var mount = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    if (mount.length() <= 1 || !mount.startsWith("/")) {
      return target;
    }
    if (target.equals(mount)) {
      return "";
    }
    return target.startsWith(mount + "/") ? target.substring(mount.length()) : target;
  }

  private static Object invokeIfCallable(Object object, HttpRequest httpRequest) {
    if (object instanceof Runnable runnable) {
      runnable.run();
      return "Done";
    }
    if (object instanceof Supplier<?> supplier) {
      return supplier.get();
    }
    if (object instanceof Callable<?> callable) {
      try {
        return callable.call();
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    if (object instanceof Function function) {
      try {
        return function.apply(httpRequest);
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    }
    return object;
  }

  private static Object postHydrateIfNeeded(Object object, HttpRequest httpRequest) {
    if (object instanceof PostHydrationHandler postHydrationHandler) {
      postHydrationHandler.onHydrated(httpRequest);
    }
    return object;
  }
}
