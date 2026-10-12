package io.mateu.core.domain.out.componentmapper;

import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;

/**
 * The actions an app's menu RUNS: a rule leaf ({@code @Menu Rule ping = …RunAction "ping"}, a
 * {@code RuleLink} from a {@code MenuSupplier}/{@code AppSupplier}) names an action of the APP,
 * which lives on the shell whatever screen is below it — so its dispatch is app-level, exactly like
 * a header action's. Without this the request (the app-level rail: the app class, no route) found
 * no screen to run it on and answered "Not found.".
 */
public final class MenuRuleActions {

  private MenuRuleActions() {}

  /** Whether {@code app}'s menu (any depth) has a rule leaf running {@code actionId}. */
  public static boolean runs(Object app, String actionId, String route, HttpRequest httpRequest) {
    if (app == null || actionId == null) {
      return false;
    }
    return runs(AppMenuBuilder.getMenu("", app, route, httpRequest), actionId);
  }

  private static boolean runs(Collection<? extends Actionable> menu, String actionId) {
    if (menu == null) {
      return false;
    }
    for (var option : menu) {
      if (option instanceof RuleLink link
          && link.rules() != null
          && link.rules().stream()
              .anyMatch(
                  rule ->
                      (rule.action() == null || rule.action() == RuleAction.RunAction)
                          && actionId.equals(rule.actionId()))) {
        return true;
      }
      if (option instanceof Menu group && runs(group.submenu(), actionId)) {
        return true;
      }
    }
    return false;
  }
}
