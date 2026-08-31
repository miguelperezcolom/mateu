package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.MateuBundleExporter.BundleManifest;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The bundle manifest carries the mount's authored route registry.
 *
 * <p>It has to: a statically deployed mount has no server left to ask what a URL means, so the
 * renderer resolves it from shipped data. Only the authored half travels — the derived half is
 * route→class, and a class is exactly what a bundle with no backend cannot use.
 */
class BundleManifestRoutesTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  @Test
  void aManifestBuiltTheOldWayCarriesAnEmptyTableRatherThanNull() {
    // The four-argument shape is kept so existing callers are unaffected; it must not produce a
    // manifest whose `routes` is null, or every reader would need a null check.
    var manifest = new BundleManifest("", "now", true, List.of());
    assertThat(manifest.routes()).isNotNull();
    assertThat(manifest.routes().routes()).isEmpty();
  }

  @Test
  void theRegistryTravelsOnTheWireWithItsParameters() throws Exception {
    var table =
        new RouteTable(
            List.of(
                new RouteEntry(
                    "tickets/open", null, "com.acme.Tickets", Map.of("status", "open"), null),
                new RouteEntry("about", "about.yaml", null, null, null)));

    var json = JSON.writeValueAsString(new BundleManifest("", "now", true, List.of(), table));
    var back = JSON.readValue(json, BundleManifest.class);

    var pinned = back.routes().match("tickets/open").orElseThrow().entry();
    assertThat(pinned.viewModel()).isEqualTo("com.acme.Tickets");
    assertThat(pinned.fixedParams()).containsEntry("status", "open");

    // The route with no view model survives the round trip: that IS the statically served case.
    var staticOnly = back.routes().match("about").orElseThrow().entry();
    assertThat(staticOnly.definition()).isEqualTo("about.yaml");
    assertThat(staticOnly.viewModel()).isNull();
  }

  @Test
  void theShippedTableStillResolvesRoutesOnceDeserialized() throws Exception {
    var table = new RouteTable(List.of(RouteEntry.of("orders/:id", "com.acme.Order")));
    var back =
        JSON.readValue(
            JSON.writeValueAsString(new BundleManifest("", "now", true, List.of(), table)),
            BundleManifest.class);

    var match = back.routes().match("orders/42").orElseThrow();
    assertThat(match.pathParams()).containsEntry("id", "42");
  }
}
