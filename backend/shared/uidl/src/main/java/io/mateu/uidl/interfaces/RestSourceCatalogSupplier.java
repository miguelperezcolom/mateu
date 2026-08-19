package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.RestSourceEntry;
import java.util.List;

/**
 * Implemented by a BEAN that contributes entries to the app's REST source catalogue at runtime,
 * rather than declaring them as {@code @RestSource} annotations — for a catalogue that comes from
 * configuration, from a database, or that differs per environment.
 *
 * <p>Not to be confused with {@link RestSourceSupplier}, which is implemented by a VIEW and
 * declares the sources of that one screen. This one is app-wide and feeds the shared catalogue, so
 * the entries it returns are referenceable by name from any surface.
 *
 * <p>Like {@code RestSourceSupplier}, the declarations are read on the server from server-side
 * state. <strong>An implementation must build them from what the server holds — configuration, a
 * stored catalogue — and never from the request or the component state</strong>, or proxy mode's
 * refusal to fetch a client-chosen URL is handed back.
 */
public interface RestSourceCatalogSupplier {

  /** The entries this bean contributes. Empty when it contributes none. */
  List<RestSourceEntry> restSources();
}
