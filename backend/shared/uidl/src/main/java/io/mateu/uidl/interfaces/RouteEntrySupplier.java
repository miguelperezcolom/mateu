package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.RouteEntry;
import java.util.List;

/**
 * Implemented by a BEAN that contributes entries to the app's route registry <em>in code</em>,
 * rather than declaring them in {@code routes.yaml} — for routes that come from configuration, from
 * a database, or that differ per environment.
 *
 * <p>This is the programmatic half of the authored side of the two-producer route table, the
 * symmetric counterpart of {@link RestSourceCatalogSupplier} for sources. An annotation can only
 * ever express the one-to-one case (one class, one route); a {@link RouteEntry} built here
 * expresses the FULL model the YAML can — a route binding a definition, a view model and pinned
 * parameters independently, one definition serving several routes, nested-slot sub-routes, and a
 * route with NO view model at all.
 *
 * <p><strong>Precedence.</strong> The entries returned here join the AUTHORED half of the registry
 * and are consulted by route resolution (unlike the annotation-derived half, which the {@code
 * RoutedClassProvider}s already carry). An entry authored in {@code routes.yaml} for the same route
 * still wins — the last-mile YAML override that lets a deployment be re-pointed without a rebuild —
 * so the order is: <b>{@code routes.yaml} &gt; this supplier &gt; annotation-derived</b>. A
 * supplied entry replaces an annotation-derived one for the same route outright, never field by
 * field.
 *
 * <p>Like every server-side supplier, an implementation builds its entries from what the SERVER
 * holds and never from the request or the component state.
 */
public interface RouteEntrySupplier {

  /** The route entries this bean contributes. Empty when it contributes none. */
  List<RouteEntry> routes();
}
