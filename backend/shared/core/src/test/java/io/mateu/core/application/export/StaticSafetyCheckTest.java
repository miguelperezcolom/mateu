package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The static-safety report: what makes a bundle declared static still need a server. Each rule is a
 * thing only a JVM can do; the report names the route and the reason, so the build fails with
 * something an author can act on instead of a "request failed" on a CDN.
 */
class StaticSafetyCheckTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  // ── fixtures ───────────────────────────────────────────────────────────────────────────────────

  public record Row(String name) {}

  /** Rows from a Java search(): needs a server. */
  public static class JavaListing implements Listing<Row> {
    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of();
    }
  }

  /** Rows from a REST source the browser calls: static-safe. */
  @RestListing(url = "https://api.example.com/rows")
  public static class RestRows implements Listing<Row> {
    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of();
    }
  }

  public static class WithJavaButton {
    @Toolbar
    public void save() {}
  }

  public static class WithRestButton {
    @Toolbar
    @Action(confirmationRequired = true)
    @RestAction(url = "https://api.example.com/x", method = "DELETE")
    public void delete() {}
  }

  @EyesOnly(roles = "admin")
  public static class Restricted {}

  public record Item(String id) implements io.mateu.uidl.interfaces.Identifiable {}

  public static class WithStore {
    public CrudStore<Item> store() {
      return null;
    }
  }

  private static RestSourceCatalog catalog() {
    return new RestSourceCatalog(
        List.of(
            new RestSourceEntry(
                "proxied",
                RestDataSource.builder().url("https://api.example.com/p").proxy(true).build(),
                null,
                null,
                null,
                null),
            new RestSourceEntry(
                "leaky",
                RestDataSource.builder()
                    .url("https://api.example.com/l")
                    .headers(Map.of("X-Api-Key", "${secret.KEY}"))
                    .build(),
                null,
                null,
                null,
                null),
            new RestSourceEntry(
                "fine",
                RestDataSource.builder().url("https://api.example.com/f").build(),
                null,
                null,
                null,
                null)));
  }

  private static List<String> classReasons(Class<?> type) {
    return StaticSafetyCheck.checkClass("/x", type.getName(), type.getClassLoader()).stream()
        .map(StaticSafetyCheck.Violation::reason)
        .toList();
  }

  // ── classes ────────────────────────────────────────────────────────────────────────────────────

  @Test
  void aListingWhoseRowsComeFromSearchNeedsAServer() {
    assertThat(classReasons(JavaListing.class)).anyMatch(r -> r.contains("search()"));
  }

  @Test
  void aRestListingDoesNot() {
    assertThat(classReasons(RestRows.class)).isEmpty();
  }

  @Test
  void aJavaActionMethodNeedsAServerButARestActionDoesNot() {
    assertThat(classReasons(WithJavaButton.class))
        .singleElement()
        .satisfies(r -> assertThat(r).contains("save()").contains("@RestAction"));
    assertThat(classReasons(WithRestButton.class)).isEmpty();
  }

  @Test
  void eyesOnlyAndCrudStoreNeedAServer() {
    assertThat(classReasons(Restricted.class)).anyMatch(r -> r.contains("@EyesOnly"));
    assertThat(classReasons(WithStore.class)).anyMatch(r -> r.contains("CrudStore"));
  }

  // ── sources ────────────────────────────────────────────────────────────────────────────────────

  @Test
  void aProxiedSourceAndADirectSecretAreReported() throws Exception {
    var proxied =
        StaticSafetyCheck.checkSource("/x", JSON.readTree("{\"ref\":\"proxied\"}"), catalog(), "s");
    assertThat(proxied).singleElement().satisfies(v -> assertThat(v.reason()).contains("proxy"));

    var leaky =
        StaticSafetyCheck.checkSource("/x", JSON.readTree("{\"ref\":\"leaky\"}"), catalog(), "s");
    assertThat(leaky).singleElement().satisfies(v -> assertThat(v.reason()).contains("secret"));

    assertThat(
            StaticSafetyCheck.checkSource(
                "/x", JSON.readTree("{\"ref\":\"fine\"}"), catalog(), "s"))
        .isEmpty();
  }

  @Test
  void aSurfaceCanProxyACatalogueEntryOnItsOwn() throws Exception {
    assertThat(
            StaticSafetyCheck.checkSource(
                "/x", JSON.readTree("{\"ref\":\"fine\",\"proxy\":true}"), catalog(), "s"))
        .isNotEmpty();
  }

  @Test
  void theWireIsScannedButTheShellsWholeCatalogueIsNot() throws Exception {
    // the shell ships every catalogue entry once (restSources): an unused proxied one is harmless
    var shell =
        JSON.readTree(
            "{\"fragments\":[{\"component\":{\"metadata\":{\"type\":\"App\",\"restSources\":"
                + "[{\"name\":\"proxied\",\"source\":{\"url\":\"https://x\",\"proxy\":true}}]}}}]}");
    assertThat(StaticSafetyCheck.checkWire("/", shell, catalog())).isEmpty();

    var listing =
        JSON.readTree(
            "{\"fragments\":[{\"component\":{\"metadata\":{\"type\":\"Crud\",\"rowsSource\":"
                + "{\"ref\":\"proxied\"}}}}]}");
    assertThat(StaticSafetyCheck.checkWire("/rows", listing, catalog())).isNotEmpty();
  }

  @Test
  void aTriggerMustRunAnActionTheBrowserCanComplete() throws Exception {
    var serverSearch =
        JSON.readTree(
            "{\"type\":\"ServerSide\",\"actions\":[{\"id\":\"search\"}],"
                + "\"triggers\":[{\"type\":\"OnLoad\",\"actionId\":\"search\"}]}");
    assertThat(StaticSafetyCheck.checkWire("/x", serverSearch, catalog()))
        .singleElement()
        .satisfies(v -> assertThat(v.reason()).contains("OnLoad").contains("search"));

    var restData =
        JSON.readTree(
            "{\"type\":\"ServerSide\",\"actions\":[{\"id\":\"__restdata__\",\"restAction\":"
                + "{\"source\":{\"ref\":\"fine\"}}}],"
                + "\"triggers\":[{\"type\":\"OnLoad\",\"actionId\":\"__restdata__\"}]}");
    assertThat(StaticSafetyCheck.checkWire("/x", restData, catalog())).isEmpty();
  }

  // ── definitions ────────────────────────────────────────────────────────────────────────────────

  @Test
  void aDefinitionButtonNeedsARouteOrARestAction() throws Exception {
    var def =
        JSON.readTree(
            """
            {"type":"Form",
             "toolbar":[
               {"type":"Button","actionId":"back","actionable":{"type":"RouteLink","route":"x"}},
               {"type":"Button","actionId":"delete"},
               {"type":"Button","actionId":"approve"}],
             "actions":[{"id":"delete","restAction":{"source":{"ref":"fine"}}}]}
            """);
    assertThat(StaticSafetyCheck.checkDefinition("/x", def, catalog()))
        .singleElement()
        .satisfies(v -> assertThat(v.reason()).contains("'approve'"));
  }

  // ── end to end through the exporter ────────────────────────────────────────────────────────────

  @UI("")
  @Title("Unsafe")
  public static class UnsafeHome {
    public String name;

    @Toolbar
    public void save() {}
  }

  @Test
  void theExporterReportsEveryRouteThatStillNeedsAServer() {
    try (var mateu = TestMateu.withUis(UnsafeHome.class)) {
      var exporter = new MateuBundleExporter(mateu.service());
      var cl = StaticSafetyCheckTest.class.getClassLoader();
      var manifest = exporter.exportAll("", cl, true, false);
      var violations = exporter.staticSafety(manifest, cl);
      assertThat(violations)
          .anyMatch(v -> v.route().isEmpty() && v.reason().contains("UnsafeHome.save()"));
      // the message is what the build prints
      assertThat(violations.get(0).toString()).startsWith("/");
    }
  }
}
