package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * #557: under a mount whose root is an APP SHELL, a route has two loads, and the bundle has to ship
 * both.
 *
 * <p>The fresh load ({@code consumedRoute "_empty"}: a deep link, a reload) answers the SHELL; the
 * shell then asks for its content slot with its own consumed route, and THAT is the route's screen.
 * The exporter used to render only the first, so a statically served sub-route answered the shell
 * again inside the shell — "a deep link renders HOME", or nested shells until the tab died.
 */
class BundleContentLoadTest {

  /**
   * A root app shell (the {@code @Menu} makes it one) over the authored, definition-only `about`.
   */
  @UI("")
  @Title("Shell")
  public static class ShellApp implements HomeRouteSupplier {
    @Menu String about = "/about";

    @Override
    public String homeRoute() {
      return "about";
    }
  }

  static TestMateu mateu;
  static final ObjectMapper JSON = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ShellApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String typeOf(String json) throws Exception {
    var component = JSON.readTree(json).at("/fragments/0/component");
    var meta = component.at("/metadata/type").asText();
    return meta.isBlank() ? component.path("type").asText() : meta;
  }

  @Test
  void aSubRouteShipsItsShellAndItsContent() throws Exception {
    var entry = new MateuBundleExporter(mateu.service()).exportRoute("", "/about");

    assertThat(entry.ok()).as("skipped: %s", entry.skipReason()).isTrue();
    // the fresh load is the shell…
    assertThat(typeOf(entry.json())).isEqualTo("App");
    // …and the content load is the screen itself, never the shell again
    assertThat(entry.contentJson()).isNotNull();
    assertThat(typeOf(entry.contentJson())).isNotEqualTo("App");
    assertThat(entry.contentJson()).contains("About this app");
  }

  @Test
  void theRootHasNoSeparateContent() {
    // the root's fresh load IS the shell; there is no slot of its own to fill
    var entry = new MateuBundleExporter(mateu.service()).exportRoute("", "");
    assertThat(entry.ok()).isTrue();
    assertThat(entry.contentJson()).isNull();
  }

  @Test
  void theContentIsPartOfTheBundleIdentity() {
    var shellOnly = new MateuBundleExporter.BundleEntry("/x", "x", "{}", true, null);
    var withContent =
        new MateuBundleExporter.BundleEntry("/x", "x", "{}", true, null, null, null, "{\"c\":1}");
    var a = new MateuBundleExporter.BundleManifest("", "t", true, java.util.List.of(shellOnly));
    var b = new MateuBundleExporter.BundleManifest("", "t", true, java.util.List.of(withContent));
    assertThat(a.structureHash()).isNotEqualTo(b.structureHash());
  }

  @Test
  void specsModeShipsAnExpandableDefinitionInsteadOfPreRenderingIt() {
    var manifest =
        new MateuBundleExporter(mateu.service())
            .exportAll("", BundleContentLoadTest.class.getClassLoader(), true, false, true);
    // `about` (definition-only, a VerticalLayout) is expanded in the browser: raw definition, no
    // pre-rendered entry
    assertThat(manifest.definitions()).containsKey("about.yaml");
    assertThat(manifest.entries()).noneMatch(e -> "/about".equals(e.route()));
    // the root shell has a class behind it, so it is still pre-rendered
    assertThat(manifest.entries()).anyMatch(e -> "".equals(e.route()) && e.ok());
  }

  @Test
  void onlyTheTypesTheExpanderKnowsAreLeftToTheBrowser() throws Exception {
    assertThat(MateuBundleExporter.isClientExpandable(JSON.readTree("{\"type\":\"Listing\"}")))
        .isTrue();
    assertThat(
            MateuBundleExporter.isClientExpandable(
                JSON.readTree("{\"layout\":{\"type\":\"VerticalLayout\"}}")))
        .isTrue();
    assertThat(MateuBundleExporter.isClientExpandable(JSON.readTree("{\"type\":\"Wizard\"}")))
        .isFalse();
    assertThat(MateuBundleExporter.isClientExpandable(null)).isFalse();
  }
}
