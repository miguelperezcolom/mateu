package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.export.MateuBundleExporter.BundleEntry;
import io.mateu.core.application.export.MateuBundleExporter.BundleManifest;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The manifest's identity: what the bundle CONTAINS, independent of when it was built.
 *
 * <p>A bundle is derivation frozen in time — deployed to a CDN it can outlive the model it came
 * from, and in a hybrid deploy a client can answer loads from build N while posting actions to a
 * backend at N+1, with nothing saying so. The hash is what turns the bundle into a <em>cache</em>
 * rather than a fork: same hash, same screens.
 */
class BundleStructureHashTest {

  private static BundleManifest manifest(String generatedAt, List<BundleEntry> entries) {
    return new BundleManifest("", generatedAt, true, entries);
  }

  private static BundleEntry ok(String route, String json) {
    return new BundleEntry(route, route, json, true, null);
  }

  @Test
  void twoBuildsOfTheSameScreensShareAHash() {
    // The point of the hash: `generatedAt` differs on every build, so it cannot answer "is this the
    // same bundle?". The content can.
    var a = manifest("2026-08-12T09:00:00Z", List.of(ok("home", "{\"a\":1}")));
    var b = manifest("2026-08-12T18:30:00Z", List.of(ok("home", "{\"a\":1}")));

    assertThat(a.structureHash()).isEqualTo(b.structureHash());
  }

  @Test
  void aChangedScreenChangesTheHash() {
    var before = manifest("t", List.of(ok("home", "{\"a\":1}")));
    var after = manifest("t", List.of(ok("home", "{\"a\":2}")));

    assertThat(after.structureHash()).isNotEqualTo(before.structureHash());
  }

  @Test
  void aRouteDroppingOutOfTheBundleChangesTheHash() {
    // The silent regression this guards: a route that stops being bundled still leaves an entry,
    // but a skipped one — and that must not look like the same bundle.
    var bundled = manifest("t", List.of(ok("home", "{}"), ok("about", "{}")));
    var skipped =
        manifest(
            "t",
            List.of(
                ok("home", "{}"), new BundleEntry("about", "about", null, false, "needs a DB")));

    assertThat(skipped.structureHash()).isNotEqualTo(bundled.structureHash());
  }

  @Test
  void theHashDoesNotDependOnEntryOrder() {
    // Route discovery walks beans and indexes, so the order is not guaranteed between builds; a
    // hash that changed with it would report drift that is not there and get ignored.
    var one = manifest("t", List.of(ok("a", "{}"), ok("b", "{}")));
    var other = manifest("t", List.of(ok("b", "{}"), ok("a", "{}")));

    assertThat(one.structureHash()).isEqualTo(other.structureHash());
  }

  @Test
  void theHashIsAHexDigest() {
    assertThat(manifest("t", List.of(ok("home", "{}"))).structureHash())
        .hasSize(64)
        .matches("[0-9a-f]+");
  }
}
