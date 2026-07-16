package io.mateu.uidl.data;

import java.util.List;

/**
 * An action button rendered on the app header, next to the {@code @AppContext} selectors. {@code
 * actionId} names the public method of the {@code @UI} class to invoke (same dispatch as
 * {@code @Fab}); {@code icon} is an optional vaadin icon name. An action with {@code children}
 * renders as a dropdown menu instead of a button: only the children dispatch.
 */
public record AppHeaderAction(
    String actionId, String label, String icon, List<AppHeaderAction> children) {

  public AppHeaderAction(String actionId, String label) {
    this(actionId, label, null, null);
  }

  public AppHeaderAction(String actionId, String label, String icon) {
    this(actionId, label, icon, null);
  }

  /** A dropdown of actions under one header button. */
  public static AppHeaderAction menu(String label, String icon, List<AppHeaderAction> children) {
    return new AppHeaderAction(null, label, icon, children);
  }
}
