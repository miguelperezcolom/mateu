package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.DefaultActionRunnerProvider.asFlux;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

@Named
@Singleton
public class ComponentTreeActionRunner implements ActionRunner {

  // todo: cacheable?
  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    // a DtoSupplier (a crud, any orchestrator) has no fluent tree to look a button up in: asking
    // for it throws, and that failed EVERY action no runner before this one had claimed — the
    // search of a listing's @Lookup filter, sent to the crud that owns the listing, among them
    if (instance instanceof io.mateu.uidl.interfaces.DtoSupplier) {
      return false;
    }
    if (instance instanceof ComponentTreeSupplier componentTreeSupplier) {
      var button = findButton(componentTreeSupplier, actionId, httpRequest);
      return button != null;
    }
    return false;
  }

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    Button button =
        findButton((ComponentTreeSupplier) instance, command.actionId(), command.httpRequest());
    Object result = null;
    if (button != null) {
      if (button.runnable() != null) {
        button.runnable().run();
      }
      if (button.callable() != null) {
        try {
          result = button.callable().call();
        } catch (Exception e) {
          // the button's Callable (user code) threw — surface its real failure, not a lombok mask
          throw e instanceof RuntimeException re ? re : new RuntimeException(e);
        }
      }
    }
    return asFlux(result, instance);
  }

  private Button findButton(
      ComponentTreeSupplier componentTreeSupplier, String actionId, HttpRequest httpRequest) {
    // the same walk the view advertises these ids with (TreeActionHarvester): whatever is
    // advertised is found here, and nothing that is not
    return FluentHandlerButtons.find(componentTreeSupplier.component(httpRequest), actionId);
  }
}
