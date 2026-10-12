package io.mateu.maven.bundle;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import io.mateu.maven.bundle.fixtures.ServerPage;
import io.mateu.maven.bundle.fixtures.StaticPage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.project.MavenProject;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * The {@code mateu-bundle:bundle} goal end to end: discovery from the compiled index, rendering,
 * writing, and the build-breaking switches a CI relies on — {@code staticOnly} failing the build
 * when a route still needs a server, {@code failOnEmpty}, an unknown renderer. Until now only the
 * writer had a test; the goal itself ran nowhere but in the archetype projects.
 *
 * <p>The "app classpath" is a temp directory holding only the index ({@code
 * META-INF/mateu/ui-registrations}); the fixture classes it names resolve through the plugin realm
 * (parent-first), as framework classes do in a real build.
 */
public class BundleMojoTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path app;
  Path assets;
  Path out;

  @Before
  public void dirs() throws Exception {
    app = tmp.newFolder("app").toPath();
    assets = tmp.newFolder("assets").toPath();
    out = tmp.newFolder("out").toPath();
  }

  private BundleMojo mojo(Class<?>... uis) throws Exception {
    var index = new StringBuilder();
    for (var ui : uis) {
      var path = ui.getAnnotation(io.mateu.uidl.annotations.UI.class).value();
      index.append("class=").append(ui.getName()).append("\npath=").append(path).append("\n---\n");
    }
    var meta = app.resolve("META-INF/mateu");
    Files.createDirectories(meta);
    Files.writeString(meta.resolve("ui-registrations"), index.toString());
    Files.writeString(
        assets.resolve("_index.html"),
        "<html><head><title>AQUIELTITULODELAPAGINA</title></head><body></body></html>");
    Files.createDirectories(assets.resolve("assets"));
    Files.writeString(assets.resolve("assets/app.js"), "// renderer");

    var mojo = new BundleMojo();
    set(
        mojo,
        "project",
        new MavenProject() {
          @Override
          public List<String> getRuntimeClasspathElements() {
            return List.of(app.toString());
          }
        });
    set(mojo, "outputDirectory", out.toFile());
    set(mojo, "baseUrl", "");
    set(mojo, "skipParamRoutes", true);
    set(mojo, "assetsFrom", assets.toString());
    set(mojo, "pageTitle", "Bundle test");
    set(mojo, "renderer", "vaadin");
    return mojo;
  }

  private static void set(Object target, String name, Object value) throws Exception {
    var field = BundleMojo.class.getDeclaredField(name);
    field.setAccessible(true);
    field.set(target, value);
  }

  @Test
  public void aStaticRouteIsRenderedAndWritten() throws Exception {
    var mojo = mojo(StaticPage.class);
    set(mojo, "staticOnly", true);
    set(mojo, "failOnEmpty", true);

    mojo.execute();

    var manifest = Files.readString(out.resolve("manifest.json"));
    assertTrue(manifest, manifest.contains("about") && manifest.contains("Static page"));
    assertTrue(Files.readString(out.resolve("index.html")).contains("Bundle test"));
    assertTrue(Files.exists(out.resolve("assets/app.js")));
    assertTrue(Files.exists(out.resolve("_redirects")));
  }

  @Test
  public void staticOnlyFailsTheBuildWhenARouteStillNeedsAServer() throws Exception {
    var mojo = mojo(StaticPage.class, ServerPage.class);
    set(mojo, "staticOnly", true);

    var failure = assertThrows(MojoFailureException.class, mojo::execute);
    assertTrue(failure.getMessage(), failure.getMessage().contains("declared static (staticOnly)"));
    assertTrue(failure.getMessage(), failure.getMessage().contains("need a server"));
  }

  @Test
  public void withoutStaticOnlyTheSameAppBundlesForABackend() throws Exception {
    var mojo = mojo(StaticPage.class, ServerPage.class);

    mojo.execute();

    assertTrue(Files.readString(out.resolve("manifest.json")).contains("orders"));
  }

  @Test
  public void failOnEmptyFailsWhenNoRouteIsRendered() throws Exception {
    var mojo = mojo(StaticPage.class);
    set(mojo, "routes", List.of("no-such-route"));
    set(mojo, "failOnEmpty", true);

    var failure = assertThrows(MojoFailureException.class, mojo::execute);
    assertTrue(failure.getMessage(), failure.getMessage().contains("no routes rendered"));
  }

  @Test
  public void anUnknownRendererIsRefused() throws Exception {
    var mojo = mojo(StaticPage.class);
    set(mojo, "renderer", "bootstrap");

    var failure = assertThrows(MojoFailureException.class, mojo::execute);
    assertTrue(failure.getMessage(), failure.getMessage().contains("unknown renderer 'bootstrap'"));
    assertFalse(Files.exists(out.resolve("manifest.json")));
  }

  @Test
  public void theEnvironmentPropertyIsRestoredAfterTheBuild() throws Exception {
    System.clearProperty("mateu.environment");
    var mojo = mojo(StaticPage.class);
    set(mojo, "environment", "staging");

    mojo.execute();

    assertNull(System.getProperty("mateu.environment"));
    assertTrue(new File(out.toFile(), "manifest.json").exists());
  }
}
