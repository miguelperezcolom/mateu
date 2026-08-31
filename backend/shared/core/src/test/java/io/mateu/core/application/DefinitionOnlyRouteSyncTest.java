package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A route declared in {@code routes.yaml} with a definition and NO view model.
 *
 * <p>This is what a statically deployed screen is: a layout plus client-side data, with no server
 * class behind it. It has to render through the ordinary sync path — if it does, the static bundle
 * can pre-render it like any other route and nothing special is needed to serve it with no backend.
 */
class DefinitionOnlyRouteSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aRouteWithADefinitionAndNoViewModelRenders() {
    var increment = mateu.sync("/about");
    assertThat(increment).isNotNull();
    assertThat(increment.fragments())
        .as("the definition's layout should have rendered")
        .isNotEmpty();
  }

  @Test
  void theBundleExporterIncludesIt() {
    // Because it renders server-side, the exporter can pre-render it like any other route — which
    // is what lets a static host serve it with no backend, without a client-side YAML renderer.
    var exporter = new io.mateu.core.application.export.MateuBundleExporter(mateu.service());
    var manifest = exporter.export("", java.util.List.of("/about"));

    var about =
        manifest.entries().stream()
            .filter(e -> "/about".equals(e.route()))
            .findFirst()
            .orElseThrow();
    assertThat(about.ok()).as("skipped because: %s", about.skipReason()).isTrue();
    assertThat(about.json()).isNotBlank();
  }
}
