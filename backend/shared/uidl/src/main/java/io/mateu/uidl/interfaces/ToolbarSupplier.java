package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.UserTrigger;
import java.util.Collection;

/**
 * Supplies a view's toolbar buttons/actions programmatically. Implement {@link #toolbar()} to
 * return the {@link UserTrigger}s rendered in the page toolbar; takes precedence over
 * {@code @Toolbar} annotated methods.
 */
public interface ToolbarSupplier {

  Collection<UserTrigger> toolbar();
}
