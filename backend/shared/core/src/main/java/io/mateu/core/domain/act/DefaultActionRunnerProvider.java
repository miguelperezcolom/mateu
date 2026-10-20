package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.application.security.ActionMethods;
import io.mateu.core.domain.out.fragmentmapper.mappers.AdvertisedActions;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class DefaultActionRunnerProvider implements ActionRunnerProvider {

  private final BeanProvider beanProvider;
  private final InstanceFactoryProvider instanceFactoryProvider;

  /**
   * Request attribute set when a crud's navigation action ({@code view}, {@code edit}, {@code new})
   * moved to a sub-route an AUTHORED route overrides: the author's view model is loaded there
   * instead of being asked to run the crud's action (which it does not know, so it was refused).
   */
  public static final String AUTHORED_SUBROUTE_LOAD = "_mateuAuthoredCrudSubRoute";

  @Override
  public ActionRunner get(
      Object instance,
      String actionId,
      String consumedRoute,
      String route,
      HttpRequest httpRequest) {
    if (instance == null) {
      throw new IllegalStateException("No method with name " + actionId + " on null");
    }
    if (actionId == null) {
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
    // the route LOAD: "" from the web client, "__load__" from a shell's bootstrap — same thing;
    // and a crud's navigation to a sub-route an authored route overrides (the author's view is
    // LOADED there: see AUTHORED_SUBROUTE_LOAD)
    if ("".equals(actionId)
        || "__load__".equals(actionId)
        || Boolean.TRUE.equals(httpRequest.getAttribute(AUTHORED_SUBROUTE_LOAD))) {
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
      return new ActionRunner() {
        @Override
        public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
          return false;
        }

        @Override
        public Flux<?> run(Object instance, RunActionCommand command) {
          if (instance instanceof ActionHandler handlesActions) {
            return asFlux(handlesActions.handleAction(actionId, httpRequest), instance);
          }
          // No runner claims the id and the view is no ActionHandler deciding for itself: an id
          // the view ADVERTISES (a trigger or subscription naming a refresh, a declared action
          // whose behaviour is client-side…) re-renders it, as it always did; an id nobody
          // advertises names nothing — wire input, refused (403 + one WARN), never a silent 200
          // reload (the answer the .NET and Python backends give).
          if (!AdvertisedActions.advertises(instance, httpRequest, actionId)) {
            throw ActionMethods.noSuchAction(instance.getClass(), actionId);
          }
          return Flux.just(instance);
        }
      };
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
