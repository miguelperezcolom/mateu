package io.mateu.core.domain.act;

import static io.mateu.core.application.runaction.RunActionUseCase.resolveMenu;
import static io.mateu.core.domain.Humanizer.camelcasize;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
@RequiredArgsConstructor
public class DefaultActionRunnerProvider implements ActionRunnerProvider {

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;

  @SneakyThrows
  @Override
  public ActionRunner get(
      Object instance,
      String actionId,
      String consumedRoute,
      String route,
      HttpRequest httpRequest) {
    if (instance == null) {
      throw new NoSuchMethodException("No method with name " + actionId + " on null");
    }
    if (instance instanceof ActionHandler handlesActions) {
      if (handlesActions.supportsAction(actionId)) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
            return false;
          }

          @Override
          public Flux<?> run(Object instance, RunActionCommand command) {
            var result = handlesActions.handleAction(actionId, httpRequest);
            return asFlux(result, instance);
          }
        };
      }
    }
    if ("".equals(actionId)) {
      return new ActionRunner() {
        @Override
        public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
          return false;
        }

        @Override
        public Flux<?> run(Object instance, RunActionCommand command) {
          return Flux.just(instance);
        }
      };
    }
    var runner =
        beanProvider.getBeans(ActionRunner.class).stream()
            .filter(factory -> factory.supports(instance, actionId, httpRequest))
            .min(Comparator.comparingInt(ActionRunner::priority));
    if (runner.isEmpty()) {
      throw new NoSuchMethodException(
          "No method with name " + actionId + " on " + instance.getClass().getName());
    }
    return runner.get();
  }

  public static Flux<?> asFlux(Object result, Object instance) {
    if (result instanceof Flux<?> flux) {
      return flux;
    }
    if (result instanceof Mono<?> mono) {
      return mono.flux();
    }
    if (result == null) {
      return Flux.just(instance);
    }
    return Flux.just(result);
  }


  public static String getMinimalAppRoute(RouteResolver appRouteResolver, String route) {
    var minimalRoute = route;
    var nextRoute = minimalRoute;
    while (!nextRoute.isEmpty() && appRouteResolver.supportsRoute(nextRoute)) {
      minimalRoute = nextRoute;
      nextRoute = nextRoute.contains("/") ? nextRoute.substring(0, nextRoute.lastIndexOf("/")) : "";
    }
    return minimalRoute;
  }

  private static String getPathInApp(String appRoute, Actionable option) {
    if (option.path() == null) {
      return appRoute + "/" + camelcasize(option.label());
    }
    return option.path();
  }
}
