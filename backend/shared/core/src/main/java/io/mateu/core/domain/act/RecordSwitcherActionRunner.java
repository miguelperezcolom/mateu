package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RecordSwitcherSupplier;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

/**
 * The header record switcher's pick ({@link RecordSwitcherSupplier#ACTION_ID} with the picked value
 * in {@link RecordSwitcherSupplier#VALUE_PARAMETER}): runs the page's {@code switchTo}. A null
 * answer re-renders the page in place, as {@code return this} would.
 */
@Named
@Singleton
public class RecordSwitcherActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    return instance instanceof RecordSwitcherSupplier
        && RecordSwitcherSupplier.ACTION_ID.equals(actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var httpRequest = command.httpRequest();
    var parameters = httpRequest.runActionRq().parameters();
    var picked =
        parameters != null && parameters.get(RecordSwitcherSupplier.VALUE_PARAMETER) != null
            ? parameters.get(RecordSwitcherSupplier.VALUE_PARAMETER).toString()
            : null;
    var result = ((RecordSwitcherSupplier) instance).switchTo(picked, httpRequest);
    return Flux.just(result != null ? result : instance);
  }
}
