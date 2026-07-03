package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;
import java.util.Collection;

/**
 * Implemented by an app shell or page to supply the components rendered in its footer region.
 * {@link #footer()} returns the fluent {@link Component}s to place there.
 */
public interface FooterSupplier {

  Collection<Component> footer();
}
