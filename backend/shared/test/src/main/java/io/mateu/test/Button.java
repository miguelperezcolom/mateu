package io.mateu.test;

import static io.mateu.test.Json.bool;
import static io.mateu.test.Json.map;
import static io.mateu.test.Json.str;

import io.mateu.uidl.annotations.Experimental;
import java.util.Map;

/** A button on a {@link Screen}: a toolbar action, a form button, a listing's New or Delete. */
@Experimental("test harness (3.0)")
public final class Button {

  private final Screen screen;
  private final Screen.Frame frame;
  final Map<String, Object> node;

  Button(Screen screen, Screen.Frame frame, Map<String, Object> node) {
    this.screen = screen;
    this.frame = frame;
    this.node = node;
  }

  /**
   * What it reads.
   *
   * @return the label
   */
  public String label() {
    return str(node.get("label"));
  }

  /**
   * The action it runs (the method name of a {@code @Button}/{@code @Toolbar}, {@code save}, {@code
   * new}…).
   *
   * @return the action id, empty for a button that only navigates
   */
  public String actionId() {
    var actionId = str(node.get("actionId"));
    return actionId.isEmpty() ? str(node.get("id")) : actionId;
  }

  /**
   * Whether it can be pressed ({@code @DisabledUnless} the caller does not satisfy disables it).
   *
   * @return whether it is enabled
   */
  public boolean enabled() {
    return !bool(node.get("disabled"));
  }

  /**
   * Presses it: runs its action (or follows its route) and applies the answer.
   *
   * @return the screen, showing the result
   * @throws AssertionError when it is disabled
   */
  public Screen press() {
    if (!enabled()) {
      throw new AssertionError("Button \"" + describe() + "\" is disabled");
    }
    var route = str(node.get("route"));
    if (!route.isEmpty()) {
      return screen.navigate(route);
    }
    screen.startGesture();
    screen.dispatch(frame, actionId(), map(node.get("parameters")));
    return screen;
  }

  String describe() {
    return label().isEmpty() ? actionId() : label() + " (" + actionId() + ")";
  }

  @Override
  public String toString() {
    return describe();
  }
}
