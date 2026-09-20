package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.MateuService;
import io.mateu.core.testutil.TestMateu;
import org.junit.jupiter.api.Test;

/**
 * SPECS MODE (Phase 6, #1/#10): the bundle ships the RAW authored definitions so a static site can
 * expand a definition-only route to the wire IN THE BROWSER via the client-side expander — no
 * backend, no re-export. Only client-expandable definitions travel (a {@code definition} with no
 * {@code viewModel}); a {@code viewModel} route needs a backend and is omitted. The definitions
 * come from the mount's authored {@code specs/ui/routes.yaml} on the test classpath.
 */
class BundleDefinitionsTest {

  private static MateuBundleExporter.BundleManifest bundle() {
    try (var mateu = TestMateu.withUis()) {
      var exporter = new MateuBundleExporter(mateu.context().getBean(MateuService.class));
      // The test classpath carries specs/ui/routes.yaml + the definition files it routes to.
      return exporter.exportAll("", BundleDefinitionsTest.class.getClassLoader(), true);
    }
  }

  @Test
  void shipsTheRawDefinitionForADefinitionOnlyRoute() {
    var definitions = bundle().definitions();

    // `about` (routes.yaml → about.yaml, no viewModel) travels raw, parsed to JSON, so the client
    // expander can render it with no backend. The layout is the authored tree, NOT the expanded
    // wire — expansion happens in the browser.
    assertThat(definitions).containsKey("about.yaml");
    var about = definitions.get("about.yaml");
    assertThat(about.has("layout")).isTrue();
    assertThat(about.at("/layout/type").asText()).isEqualTo("VerticalLayout");
  }

  @Test
  void omitsADefinitionThatNeedsABackend() {
    // shared-list.yaml is bound to a viewModel by catalog/books and catalog/films (server logic
    // that
    // cannot run in the browser), so it is NOT shipped as a client-expandable definition.
    assertThat(bundle().definitions()).doesNotContainKey("shared-list.yaml");
  }

  @Test
  void oldConstructorsCarryEmptyDefinitionsRatherThanNull() {
    // The pre-specs-mode shapes must not produce a null map, or every reader would need a null
    // check.
    var manifest = new MateuBundleExporter.BundleManifest("", "now", true, java.util.List.of());
    assertThat(manifest.definitions()).isNotNull().isEmpty();
  }
}
