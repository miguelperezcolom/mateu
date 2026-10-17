package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * An action button rendered on the app header, next to the {@code @AppContext} selectors. {@code
 * actionId} names the public method of the {@code @UI} class to invoke (same dispatch as
 * {@code @Fab}); {@code icon} is an optional vaadin icon name. An action with {@code children}
 * renders as a dropdown menu instead of a button: only the children dispatch.
 *
 * <p>{@code route} makes the button NAVIGATE inside the app instead (the data-authored shell's
 * {@code headerActions:}); and an {@code actionId} naming one of the shell's {@code actions:} or an
 * action-catalogue entry runs that in the browser, like a menu leaf's {@code RunAction} rule.
 */
@Builder
public record AppHeaderAction(
    String actionId,
    String label,
    String icon,
    List<AppHeaderAction> children,
    @io.mateu.uidl.annotations.Experimental("YAML app shell extras (3.0 beta)") String route) {

  public AppHeaderAction(
      String actionId, String label, String icon, List<AppHeaderAction> children) {
    this(actionId, label, icon, children, null);
  }

  public AppHeaderAction(String actionId, String label) {
    this(actionId, label, null, null, null);
  }

  public AppHeaderAction(String actionId, String label, String icon) {
    this(actionId, label, icon, null, null);
  }

  /** A dropdown of actions under one header button. */
  public static AppHeaderAction menu(String label, String icon, List<AppHeaderAction> children) {
    return new AppHeaderAction(null, label, icon, children, null);
  }
}
