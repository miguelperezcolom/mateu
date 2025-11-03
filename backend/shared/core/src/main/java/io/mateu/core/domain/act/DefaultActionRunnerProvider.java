package io.mateu.core.domain.act;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
public class DefaultActionRunnerProvider implements ActionRunnerProvider {

  private final BeanProvider beanProvider;

  public DefaultActionRunnerProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

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
          public Flux<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
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
        public Flux<?> run(
            Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
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
}
