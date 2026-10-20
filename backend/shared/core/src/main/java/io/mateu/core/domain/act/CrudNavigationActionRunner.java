package io.mateu.core.domain.act;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.domain.CrudNavigation;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import reactor.core.publisher.Flux;

/**
 * Runs the CRUD navigation Mateu adds to a page that overrides a CRUD's sub-screen through an
 * authored route ({@link CrudNavigation}): "Back to list", "Edit" and "Cancel" navigate where the
 * built-in screen's would. A page that declares the action itself keeps it.
 */
@Named
@Singleton
public class CrudNavigationActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    var navigation = CrudNavigation.of(instance, httpRequest);
    return navigation != null
        && navigation.targets().containsKey(actionId)
        && !CrudNavigation.ownsAction(instance, actionId);
  }

  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var navigation = CrudNavigation.of(instance, command.httpRequest());
    return Flux.just(UICommand.navigateTo(navigation.targets().get(command.actionId())));
  }
}
