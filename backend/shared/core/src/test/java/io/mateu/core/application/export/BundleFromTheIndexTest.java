package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The build-time export (the Maven goal) learns routes from the compiled index and from
 * routes.yaml, with no live bean for them: a class listed only in the index that is gated on
 * identity is still kept backend-served, a definition-only route is bundled, a route whose
 * definition file is missing does not sink the bundle, and the required capabilities are the union
 * over the bundled entries.
 */
class BundleFromTheIndexTest {

  @Title("Indexed secret")
  @EyesOnly(roles = "admin")
  public static class IndexedSecret {
    public String name = "x";
  }

  static final class Fixture extends ClassLoader {
    private final URLClassLoader files;

    Fixture() {
      super(BundleFromTheIndexTest.class.getClassLoader());
      URL root = BundleFromTheIndexTest.class.getResource("/s1-f4/indexed/");
      this.files = new URLClassLoader(new URL[] {root}, null);
    }

    private static boolean isFixture(String name) {
      return name.startsWith("specs/ui") || name.startsWith("META-INF/mateu/");
    }

    @Override
    public URL getResource(String name) {
      return isFixture(name) ? files.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isFixture(name) ? files.getResources(name) : super.getResources(name);
    }
  }

  private static BundleManifest export() {
    var fixture = new Fixture();
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(fixture);
    try (var mateu = TestMateu.withUis()) {
      return new MateuBundleExporter(mateu.service()).exportAll("", fixture, true);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static BundleEntry entry(BundleManifest manifest, String route) {
    return manifest.entries().stream()
        .filter(e -> route.equals(e.route()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no " + route + " in " + manifest.entries()));
  }

  @Test
  void anIdentityGatedClassKnownOnlyFromTheIndexIsKeptBackendServed() {
    var secret = entry(export(), "/indexed-secret");
    assertThat(secret.ok()).isFalse();
    assertThat(secret.skipReason()).contains("identity-dependent").contains("@EyesOnly");
  }

  @Test
  void aDefinitionOnlyRouteIsBundledAndAMissingDefinitionDoesNotSinkTheBundle() {
    var manifest = export();
    assertThat(entry(manifest, "/about").json()).contains("About us");
    assertThat(manifest.definitions()).doesNotContainKey("missing.yaml");
    assertThat(manifest.entries()).extracting(BundleEntry::route).contains("/ghost");
  }

  @Test
  void requiredCapabilitiesAreTheUnionOverBundledEntries() {
    var entries =
        List.of(
            new BundleEntry(
                "/a",
                "a",
                "{\"x\":[{\"requiredCapabilities\":[\"maps\",\"\",3]}],"
                    + "\"y\":{\"requiredCapabilities\":[\"charts\",\"maps\"]}}",
                true,
                null),
            new BundleEntry("/b", "b", "{\"requiredCapabilities\":[\"never\"]}", false, "skipped"),
            new BundleEntry("/c", "c", " ", true, null),
            new BundleEntry("/d", "d", "{not json", true, null));
    assertThat(BundleManifest.aggregateCapabilities(entries)).containsExactly("charts", "maps");
  }
}
