package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ComponentEntry;
import java.util.List;

/**
 * Implemented by a BEAN that contributes entries to the app's business-component catalogue at
 * runtime (coherence-plan #13), rather than declaring them with {@code @BusinessComponent} — for a
 * catalogue that comes from configuration, a database, or that differs per environment. The
 * programmatic twin of {@link RestSourceCatalogSupplier}, one level up (a composition, not an
 * endpoint).
 *
 * <p>Read on the server from server-side state; an implementation must build the entries from what
 * the server holds, never from the request or the component state — the same rule the source
 * suppliers follow.
 */
public interface ComponentCatalogSupplier {

  /** The entries this bean contributes. Empty when it contributes none. */
  List<ComponentEntry> businessComponents();
}
