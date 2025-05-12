package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.Comparator;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

@Named
public class DefaultActionRunnerProvider implements ActionRunnerProvider {

  private final BeanProvider beanProvider;

  public DefaultActionRunnerProvider(BeanProvider beanProvider) {
    this.beanProvider = beanProvider;
  }

  @SneakyThrows
  @Override
  public ActionRunner get(Object instance, String actionId) {
    if (instance == null) {
      throw new NoSuchMethodException("No method with name " + actionId + " on null");
    }
    if (instance instanceof HandlesActions handlesActions) {
      if (handlesActions.supportsAction(actionId)) {
        return new ActionRunner() {
          @Override
          public boolean supports(Object instance, String actionId) {
            return false;
          }

          @Override
          public Mono<?> run(
              Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest) {
            return handlesActions.handleAction(actionId, httpRequest);
          }
        };
      }
    }
    var runner =
        beanProvider.getBeans(ActionRunner.class).stream()
            .filter(factory -> factory.supports(instance, actionId))
            .min(Comparator.comparingInt(ActionRunner::priority));
    if (runner.isEmpty()) {
      throw new NoSuchMethodException(
          "No method with name " + actionId + " on " + instance.getClass().getName());
    }
    return runner.get();
  }
}
