package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.maven.bundle.fixtures.CataloguePage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.project.MavenProject;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * {@code mateu-bundle:openapi} as a build runs it: the screens found through the app's index, the
 * wire JSON of an exported bundle, and the switches a CI relies on. The derivation itself is pinned
 * in core ({@code OpenApiDerivationTest}); this is the goal around it.
 */
public class OpenApiMojoTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path app;
  Path out;

  /** A bundle manifest whose one entry declares an endpoint only on the wire (a YAML screen). */
  static final String WIRE =
      """
      {"fragments": [{"component": {"type": "ClientSide", "metadata": {"type": "Crud",
        "rowsSource": {"url": "/api/wired/invoices", "itemsPath": "items"},
        "columns": [{"type": "ClientSide", "metadata": {"type": "GridColumn", "id": "number",
          "dataType": "string"}}]}}}]}
      """;

  @Before
  public void dirs() throws Exception {
    app = tmp.newFolder("app").toPath();
    out = tmp.newFolder("out").toPath();
  }

  private OpenApiMojo mojo(Class<?>... uis) throws Exception {
    var index = new StringBuilder();
    for (var ui : uis) {
      var path = ui.getAnnotation(io.mateu.uidl.annotations.UI.class).value();
      index.append("class=").append(ui.getName()).append("\npath=").append(path).append("\n---\n");
    }
    var meta = app.resolve("META-INF/mateu");
    Files.createDirectories(meta);
    Files.writeString(meta.resolve("ui-registrations"), index.toString());

    var mojo = new OpenApiMojo();
    Mojos.set(
        mojo,
        "project",
        new MavenProject() {
          @Override
          public List<String> getRuntimeClasspathElements() {
            return List.of(app.toString());
          }
        });
    Mojos.set(mojo, "outputFile", out.resolve("api/mateu-openapi.json").toFile());
    Mojos.set(mojo, "title", "Catalogue API");
    Mojos.set(mojo, "manifestFile", out.resolve("mateu-bundle/manifest.json").toFile());
    return mojo;
  }

  private JsonNode written() throws Exception {
    return new ObjectMapper().readTree(out.resolve("api/mateu-openapi.json").toFile());
  }

  private void writeManifest(String content) throws Exception {
    Files.createDirectories(out.resolve("mateu-bundle"));
    Files.writeString(out.resolve("mateu-bundle/manifest.json"), content);
  }

  private static String manifestWith(String wire) throws Exception {
    var mapper = new ObjectMapper();
    var manifest = mapper.createObjectNode();
    manifest.putArray("entries").addObject().put("route", "invoices").put("json", wire);
    return mapper.writeValueAsString(manifest);
  }

  @Test
  public void theScreensOfTheAppBecomeTheOperationsOfTheContract() throws Exception {
    mojo(CataloguePage.class).execute();

    var document = written();
    assertThat(document.get("info").get("title").asText()).isEqualTo("Catalogue API");
    var paths = document.get("paths");
    assertThat(paths.has("/api/catalogue/products")).isTrue();
    assertThat(paths.get("/api/catalogue/products").get("get").get("x-mateu-provenance").asText())
        .isEqualTo("generate");
    // the third party's endpoint is in the contract, as something this project consumes
    assertThat(document.get("servers").toString()).contains("https://countries.example.com");
  }

  @Test
  public void bothReadsTheClassesAndTheExportedBundle() throws Exception {
    writeManifest(manifestWith(WIRE));

    mojo(CataloguePage.class).execute();

    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();
    assertThat(written().get("paths").has("/api/wired/invoices")).isTrue();
  }

  /** A mount authored as data has no class to reflect over: the bundle alone carries it. */
  @Test
  public void fromBundleIgnoresTheClasses() throws Exception {
    writeManifest(manifestWith(WIRE));
    var mojo = mojo(CataloguePage.class);
    Mojos.set(mojo, "from", " Bundle ");

    mojo.execute();

    assertThat(written().get("paths").has("/api/wired/invoices")).isTrue();
    assertThat(written().get("paths").has("/api/catalogue/products")).isFalse();
  }

  @Test
  public void fromClassesIgnoresTheBundle() throws Exception {
    writeManifest(manifestWith(WIRE));
    var mojo = mojo(CataloguePage.class);
    Mojos.set(mojo, "from", "classes");

    mojo.execute();

    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();
    assertThat(written().get("paths").has("/api/wired/invoices")).isFalse();
  }

  /**
   * An app that never ran {@code mateu:bundle}, or whose manifest is unreadable, still gets the
   * contract its classes imply: the bundle is one channel among three, not a prerequisite.
   */
  @Test
  public void aMissingOrUnreadableManifestFallsBackToTheOtherChannels() throws Exception {
    mojo(CataloguePage.class).execute();
    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();

    writeManifest("{ not json");
    mojo(CataloguePage.class).execute();
    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();

    writeManifest("{\"entries\": {}}");
    mojo(CataloguePage.class).execute();
    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();
  }

  /** An indexed class that cannot be loaded contributes nothing instead of failing the goal. */
  @Test
  public void anUnloadableIndexedClassIsSkipped() throws Exception {
    var mojo = mojo(CataloguePage.class);
    Files.writeString(
        app.resolve("META-INF/mateu/ui-registrations"),
        "class=com.acme.Gone\npath=/gone\n---\nclass="
            + CataloguePage.class.getName()
            + "\npath=/catalogue\n");

    mojo.execute();

    assertThat(written().get("paths").has("/api/catalogue/products")).isTrue();
  }

  @Test
  public void failOnEmptyFailsWhenNothingDeclaresAnEndpoint() throws Exception {
    var mojo = mojo();
    Mojos.set(mojo, "failOnEmpty", true);

    var failure = assertThrows(MojoExecutionException.class, mojo::execute);
    assertThat(failure.getMessage()).contains("nothing declares an endpoint");
    assertThat(new File(out.toFile(), "api/mateu-openapi.json")).doesNotExist();
  }

  @Test
  public void withoutFailOnEmptyAnEmptyContractIsStillWritten() throws Exception {
    mojo().execute();

    assertThat(written().get("paths")).isEmpty();
  }

  /** The goal loads the app's classes through its own loader and must leave the build's alone. */
  @Test
  public void theBuildsContextClassLoaderIsRestored() throws Exception {
    var before = Thread.currentThread().getContextClassLoader();

    mojo(CataloguePage.class).execute();

    assertThat(Thread.currentThread().getContextClassLoader()).isSameAs(before);
  }
}
