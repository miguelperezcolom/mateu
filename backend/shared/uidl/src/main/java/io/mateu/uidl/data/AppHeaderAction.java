package io.mateu.uidl.data;

/**
 * An action button rendered on the app header, next to the {@code @AppContext} selectors. {@code
 * actionId} names the public method of the {@code @UI} class to invoke (same dispatch as
 * {@code @Fab}); {@code icon} is an optional vaadin icon name.
 */
public record AppHeaderAction(String actionId, String label, String icon) {

  public AppHeaderAction(String actionId, String label) {
    this(actionId, label, null);
  }
}
