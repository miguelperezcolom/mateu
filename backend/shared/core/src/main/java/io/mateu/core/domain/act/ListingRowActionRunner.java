package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.RunMethodActionRunner.invoke;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import jakarta.inject.Named;
import java.lang.reflect.Method;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

/**
 * Runs {@code action-on-row-<method>} actions on a {@link Listing}: first the listing's own {@code
 * handleActionOnRow} hook (whose default covers the lookup {@code select} glue), then — when the
 * hook answers null — the row method is invoked reflectively by name with the standard parameter
 * injection (clicked row, HttpRequest…). This is the engine half of the row-action contract; the
 * interface half lives in {@code Listing.handleActionOnRow}.
 */
@Named
public class ListingRowActionRunner implements ActionRunner {

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return instance instanceof Listing<?>
        && actionId != null
        && actionId.startsWith("action-on-row-");
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var methodName = command.actionId().substring("action-on-row-".length());
    var result = ((Listing<?>) instance).handleActionOnRow(methodName, httpRequest);
    if (result != null) {
      return DefaultActionRunnerProvider.asFlux(result, instance);
    }
    for (Method method : getAllMethods(instance.getClass()).reversed()) {
      if (methodName.equals(method.getName())) {
        method.setAccessible(true);
        var rq = httpRequest.runActionRq();
        var invocation =
            new RunActionCommand(
                "base_url",
                "uiId",
                rq.route(),
                rq.consumedRoute(),
                rq.actionId(),
                rq.componentState(),
                rq.appState(),
                rq.initiatorComponentId(),
                httpRequest,
                rq.serverSideType(),
                rq.serverSideComponentRoute());
        Object invoked = invoke(method, instance, invocation);
        if (invoked != null) {
          return DefaultActionRunnerProvider.asFlux(invoked, instance);
        }
        break;
      }
    }
    return Flux.just(instance);
  }
}
