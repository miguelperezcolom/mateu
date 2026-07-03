package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.UserTrigger;
import java.util.Collection;

/**
 * Implemented by a page/view to supply its action buttons programmatically (an alternative to
 * {@code @Button}/{@code @Toolbar} methods, over which this takes precedence). {@link #buttons()}
 * returns the {@link UserTrigger}s to render.
 */
public interface ButtonsSupplier {

  Collection<UserTrigger> buttons();
}
