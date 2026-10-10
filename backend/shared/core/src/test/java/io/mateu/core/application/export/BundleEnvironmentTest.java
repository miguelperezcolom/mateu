package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.MateuBundleExporter.BundleEntry;
import io.mateu.core.application.export.MateuBundleExporter.BundleManifest;
import io.mateu.uidl.data.Access;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * What the three YAML features mean for a static bundle: re-pointing at another environment leaves
 * the {@code structureHash} alone, the translations travel in the manifest, and access rules —
 * which need an identity a static host does not have — are reported by the static-safety check and
 * keep their routes backend-served.
 */
class BundleEnvironmentTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  private static String shell(String ordersUrl) {
    return "{\"fragments\":[{\"component\":{\"type\":\"App\",\"title\":\"Shop\",\"restSources\":"
        + "[{\"name\":\"orders\",\"source\":{\"url\":\""
        + ordersUrl
        + "\"}}]}}]}";
  }

  private static BundleManifest manifest(String ordersUrl) {
    return new BundleManifest(
        "",
        "now",
        true,
        List.of(new BundleEntry("/", "/mateu/v3/sync/", shell(ordersUrl), true, null)));
  }

  @Test
  void reTargetingTheCatalogueDoesNotChangeTheStructureHash() {
    assertThat(manifest("https://pre.acme.com/v1/orders").structureHash())
        .isEqualTo(manifest("https://api.acme.com/v1/orders").structureHash());
  }

  @Test
  void theScreensStillDecideTheHash() {
    var other =
        new BundleManifest(
            "",
            "now",
            true,
            List.of(
                new BundleEntry(
                    "/", "/mateu/v3/sync/", shell("x").replace("Shop", "Store"), true, null)));
    assertThat(other.structureHash()).isNotEqualTo(manifest("x").structureHash());
  }

  @Test
  void theManifestCarriesTheTranslationsAndTheEnvironment() throws Exception {
    var manifest =
        new BundleManifest(
            "",
            "now",
            true,
            List.of(),
            RouteTable.empty(),
            null,
            List.of(),
            Map.of(),
            Map.of("es", Map.of("greeting.title", "Hola")),
            "pre");
    var json = JSON.readTree(JSON.writeValueAsString(manifest));
    assertThat(json.at("/translations/es/greeting.title").asText()).isEqualTo("Hola");
    assertThat(json.get("environment").asText()).isEqualTo("pre");
  }

  @Test
  void accessRulesAreAStaticSafetyViolationAndKeepTheRouteBackendServed() throws Exception {
    var restricted =
        new RouteEntry(
            "admin",
            "admin.yaml",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Access.roles("admin"));
    var guardedDefinition =
        new RouteEntry("salaries", "salaries.yaml", null, null, null, null, null);
    var table = new RouteTable(List.of(restricted, guardedDefinition));
    var definitions =
        Map.of(
            "admin.yaml",
            JSON.readTree("{\"type\":\"VerticalLayout\"}"),
            "salaries.yaml",
            JSON.readTree(
                "{\"layout\":{\"type\":\"VerticalLayout\",\"content\":[{\"type\":\"Text\","
                    + "\"text\":\"x\",\"eyesOnly\":{\"roles\":[\"hr\"]}}]}}"));

    assertThat(MateuBundleExporter.yamlAccessRestriction("/admin", table, definitions))
        .contains("access:");
    assertThat(MateuBundleExporter.yamlAccessRestriction("/salaries", table, definitions))
        .contains("salaries.yaml");

    var manifest =
        new BundleManifest(
            "", "now", true, List.of(), table, null, List.of(), definitions, Map.of(), null);
    var violations = StaticSafetyCheck.check(manifest, Map.of(), null);
    assertThat(violations)
        .anyMatch(v -> v.route().equals("/admin") && v.reason().contains("access:"))
        .anyMatch(v -> v.route().equals("/salaries") && v.reason().contains("access keys"));
  }

  @Test
  void theManifestRoundTripsARouteEntryWithAccess() throws Exception {
    var entry =
        new RouteEntry(
            "admin",
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            Access.roles("admin"));
    var json = JSON.writeValueAsString(entry);
    assertThat(json).doesNotContain("restricts");
    var back = JSON.readValue(json, RouteEntry.class);
    assertThat(back.access().roles()).containsExactly("admin");
  }
}
