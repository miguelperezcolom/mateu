package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.ComponentStateHelper.invoke;
import static io.mateu.core.application.runaction.RunActionUseCase.setResolvedRoute;
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

    if (actionable instanceof RouteLink) {
      if (emptyIfRoute) return Mono.empty();
      return findRouteResolverFn.apply(command.withConsumedRoute(route));
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
                return Mono.just(getValueOrNewInstance(beanProvider, field, object));
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
