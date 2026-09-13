package io.mateu.core.application;

import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import java.util.Map;

/**
 * A {@link RouteEntrySupplier} fixture: routes authored in CODE rather than in {@code routes.yaml},
 * exercised by {@link RouteEntrySupplierSyncTest}.
 */
public class SuppliedRoutes implements RouteEntrySupplier {

  /** A minimal view a code-supplied route can resolve to and render. */
  public static class Widget {
    public String name = "supplied";
  }

  @Override
  public List<RouteEntry> routes() {
    return List.of(
        // A plain code-authored route backed by a view model.
        RouteEntry.of("supplied/widget", Widget.class.getName()),
        // The case an annotation cannot express: a parameter the entry pins.
        new RouteEntry(
            "supplied/pinned", null, Widget.class.getName(), Map.of("mode", "compact"), Map.of()),
        // A viewModel-less rich route: a definition plus client-side data, authored in code.
        new RouteEntry("supplied/static", "about.yaml", null, Map.of(), Map.of()),
        // A collider with routes.yaml (which maps tickets/open to RegistryRoutedViews$Tickets):
        // the authored YAML must win over the code supplier.
        RouteEntry.of("tickets/open", Widget.class.getName()));
  }
}
