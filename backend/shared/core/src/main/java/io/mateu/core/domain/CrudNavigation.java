package io.mateu.core.domain;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * The CRUD navigation of a page that overrides a CRUD's sub-screen through an AUTHORED route (its
 * record page, its editor or its creation page): the buttons the built-in screen would have — in
 * the page's toolbar ("Back to list", "Edit") or among its buttons ("Cancel") — and where each of
 * their actions goes. Computed for the request's view model when the request resolves it, and read
 * by the mapping (which adds the buttons) and by the action runner (which navigates).
 *
 * @param view the view model the navigation belongs to (only that instance gets it)
 * @param toolbar the buttons for the page's toolbar
 * @param buttons the buttons for the page's button bar
 * @param targets the route each action id navigates to
 */
public record CrudNavigation(
    Object view, List<Button> toolbar, List<Button> buttons, Map<String, String> targets) {

  /** The request attribute holding it. */
  public static final String ATTRIBUTE = "_mateuCrudNavigation";

  /** The navigation {@code view} gets in this request, or null. */
  public static CrudNavigation of(Object view, HttpRequest httpRequest) {
    if (view == null || httpRequest == null) {
      return null;
    }
    return httpRequest.getAttribute(ATTRIBUTE) instanceof CrudNavigation navigation
            && navigation.view() == view
        ? navigation
        : null;
  }

  /** {@code declared} followed by the injected toolbar buttons it does not already declare. */
  public static List<UserTrigger> withToolbar(
      Object view, HttpRequest httpRequest, Collection<? extends UserTrigger> declared) {
    var navigation = of(view, httpRequest);
    return navigation == null
        ? new ArrayList<>(declared)
        : merge(declared, navigation.toolbar(), navigation.view());
  }

  /** {@code declared} followed by the injected buttons it does not already declare. */
  public static List<UserTrigger> withButtons(
      Object view, HttpRequest httpRequest, Collection<? extends UserTrigger> declared) {
    var navigation = of(view, httpRequest);
    return navigation == null
        ? new ArrayList<>(declared)
        : merge(declared, navigation.buttons(), navigation.view());
  }

  private static List<UserTrigger> merge(
      Collection<? extends UserTrigger> declared, List<Button> injected, Object view) {
    var out = new ArrayList<UserTrigger>(declared);
    var taken = new HashSet<String>();
    for (var trigger : declared) {
      if (trigger instanceof Button button && button.actionId() != null) {
        taken.add(button.actionId());
      }
    }
    for (var button : injected) {
      if (!taken.contains(button.actionId()) && !ownsAction(view, button.actionId())) {
        out.add(button);
      }
    }
    return out;
  }

  /**
   * Whether the page itself declares an action with this id (a method of that name): then the
   * page's wins — its button, and its behaviour.
   */
  public static boolean ownsAction(Object view, String actionId) {
    for (Class<?> c = view.getClass(); c != null && c != Object.class; c = c.getSuperclass()) {
      for (var method : c.getDeclaredMethods()) {
        if (method.getName().equals(actionId)) {
          return true;
        }
      }
    }
    return false;
  }
}
