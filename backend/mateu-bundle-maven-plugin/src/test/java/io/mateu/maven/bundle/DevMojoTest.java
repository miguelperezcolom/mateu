package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;
import org.apache.maven.model.Resource;
import org.apache.maven.project.MavenProject;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * {@code mateu-bundle:dev} as a developer uses it: a YAML-only app under a resource directory,
 * built, served with the SPA fallback, rebuilt when a file changes — and still served, as it last
 * built, when a change breaks the build.
 */
public class DevMojoTest {

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path src;
  Path classes;
  Path assets;
  Path out;
  DevMojo mojo;

  @Before
  public void app() throws Exception {
    src = tmp.newFolder("src").toPath();
    classes = tmp.newFolder("classes").toPath();
    assets = tmp.newFolder("assets").toPath();
    out = tmp.getRoot().toPath().resolve("target/mateu-bundle");
    var specs = src.resolve("specs/ui");
    Files.createDirectories(specs);
    Files.writeString(
        specs.resolve("app.ui.yaml"),
        "type: UI\nbasePath: /\nhome: home\nroutes:\n  - routes.yaml\n");
    Files.writeString(
        specs.resolve("routes.yaml"),
        "type: Routes\nroutes:\n  - route: home\n    layout: home.yaml\n");
    home("Welcome aboard");
    Files.writeString(
        assets.resolve("_index.html"),
        "<html><head><title>AQUIELTITULODELAPAGINA</title></head><body></body></html>");
    Files.createDirectories(assets.resolve("assets"));
    Files.writeString(assets.resolve("assets/app.js"), "// renderer");
  }

  @After
  public void stop() {
    if (mojo != null) {
      mojo.stop();
    }
  }

  private void home(String title) throws Exception {
    Files.writeString(
        src.resolve("specs/ui/home.yaml"),
        "type: VerticalLayout\ncontent:\n  - type: Text\n    text: " + title + "\n");
  }

  private DevMojo mojo(boolean liveReload) throws Exception {
    var project =
        new MavenProject() {
          @Override
          public List<String> getRuntimeClasspathElements() {
            return List.of(classes.toString());
          }
        };
    project.getBuild().setOutputDirectory(classes.toString());
    var resource = new Resource();
    resource.setDirectory(src.toString());
    project.getBuild().addResource(resource);
    var dev = new DevMojo();
    Mojos.set(dev, "project", project);
    Mojos.set(dev, "outputDirectory", out.toFile());
    Mojos.set(dev, "baseUrl", "");
    Mojos.set(dev, "skipParamRoutes", true);
    Mojos.set(dev, "assetsFrom", assets.toString());
    Mojos.set(dev, "pageTitle", "Dev test");
    Mojos.set(dev, "renderer", "vaadin");
    Mojos.set(dev, "staticOnly", true);
    Mojos.set(dev, "specsOnly", true);
    Mojos.set(dev, "port", 0);
    Mojos.set(dev, "host", "localhost");
    Mojos.set(dev, "liveReload", liveReload);
    Mojos.set(dev, "pollMillis", 50L);
    mojo = dev;
    return dev;
  }

  private String get(String path) throws Exception {
    var connection =
        (HttpURLConnection)
            URI.create("http://localhost:" + mojo.port() + path).toURL().openConnection();
    assertThat(connection.getResponseCode()).as(path).isEqualTo(200);
    try (var in = connection.getInputStream()) {
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  private static void eventually(BooleanSupplier condition) throws InterruptedException {
    var deadline = System.currentTimeMillis() + 20_000;
    while (!condition.getAsBoolean()) {
      assertThat(System.currentTimeMillis()).as("timed out").isLessThan(deadline);
      Thread.sleep(50);
    }
  }

  private String manifest() {
    try {
      return Files.readString(out.resolve("manifest.json"));
    } catch (Exception e) {
      return "";
    }
  }

  @Test
  public void servesTheBundleWithTheSpaFallbackAndTheReloadScript() throws Exception {
    mojo(true).start();

    assertThat(manifest()).contains("Welcome aboard");
    var deepLink = get("/products/42");
    assertThat(deepLink).contains("Dev test").contains(DevServer.EVENTS_PATH);
    assertThat(get("/")).contains(DevServer.EVENTS_PATH);
    assertThat(get("/assets/app.js")).isEqualTo("// renderer");
    assertThat(get("/manifest.json")).contains("Welcome aboard");
    // the script is added on the way out, never written to the bundle
    assertThat(Files.readString(out.resolve("index.html"))).doesNotContain(DevServer.EVENTS_PATH);
  }

  @Test
  public void withoutLiveReloadNothingIsInjectedAndThereIsNoStream() throws Exception {
    mojo(false).start();

    assertThat(get("/products")).contains("Dev test").doesNotContain("EventSource");
    // the events path is just another SPA route then
    assertThat(get(DevServer.EVENTS_PATH)).contains("Dev test");
  }

  @Test
  public void aChangeIsRebuiltAndAnnouncedOnTheEventStream() throws Exception {
    mojo(true).start();
    var events = new LinkedBlockingQueue<String>();
    listen(events);
    eventually(() -> mojo.server().clients() == 1);

    home("Changed title");

    eventually(() -> manifest().contains("Changed title"));
    assertThat(events.poll(20, TimeUnit.SECONDS)).isEqualTo("event: reload");
    assertThat(get("/manifest.json")).contains("Changed title");
  }

  @Test
  public void aBrokenChangeKeepsTheLastGoodBundleAndAFixRecovers() throws Exception {
    mojo(true).start();
    var events = new LinkedBlockingQueue<String>();
    listen(events);
    eventually(() -> mojo.server().clients() == 1);

    // a button that neither routes nor calls an API needs a server: staticOnly refuses it
    Files.writeString(
        src.resolve("specs/ui/home.yaml"),
        "type: VerticalLayout\ncontent:\n  - type: Text\n    text: Broken\n"
            + "  - type: Button\n    label: Save\n    actionId: save\n");

    assertThat(events.poll(20, TimeUnit.SECONDS)).isEqualTo("event: failed");
    assertThat(manifest()).contains("Welcome aboard").doesNotContain("Broken");
    assertThat(get("/home")).contains("Dev test");
    assertThat(Files.exists(out.resolveSibling("mateu-bundle.dev-next"))).isFalse();

    home("Fixed");

    eventually(() -> manifest().contains("Fixed"));
    assertThat(events.poll(20, TimeUnit.SECONDS)).isEqualTo("event: reload");
  }

  /**
   * The build would only warn and drop the screen: in dev, a half-typed save keeps the last one.
   */
  @Test
  public void yamlThatDoesNotParseKeepsTheLastGoodBundle() throws Exception {
    mojo(true).start();
    var events = new LinkedBlockingQueue<String>();
    listen(events);
    eventually(() -> mojo.server().clients() == 1);

    Files.writeString(
        src.resolve("specs/ui/home.yaml"), "type: VerticalLayout\ncontent: [unclosed\n  - {a: b\n");

    assertThat(events.poll(20, TimeUnit.SECONDS)).isEqualTo("event: failed");
    assertThat(manifest()).contains("Welcome aboard");
    assertThat(DevMojo.yamlProblem(src.resolve("specs/ui/home.yaml")))
        .hasValueSatisfying(problem -> assertThat(problem).startsWith(", line 3: "));
  }

  @Test
  public void aDeletedFileLeavesTheBuildOutputToo() throws Exception {
    var extra = src.resolve("specs/ui/extra.yaml");
    Files.writeString(extra, "type: VerticalLayout\ncontent: []\n");
    mojo(true).start();
    assertThat(classes.resolve("specs/ui/extra.yaml")).exists();

    Files.delete(extra);

    eventually(() -> !Files.exists(classes.resolve("specs/ui/extra.yaml")));
  }

  @Test
  public void aFirstBuildThatFailsServesAPageThatWaitsForTheFix() throws Exception {
    Files.writeString(
        src.resolve("specs/ui/home.yaml"),
        "type: VerticalLayout\ncontent:\n  - type: Button\n    label: Save\n    actionId: save\n");
    mojo(true).start();

    var connection =
        (HttpURLConnection)
            URI.create("http://localhost:" + mojo.port() + "/home").toURL().openConnection();
    assertThat(connection.getResponseCode()).isEqualTo(503);

    home("Fixed");

    eventually(() -> manifest().contains("Fixed"));
    assertThat(get("/home")).contains("Dev test");
  }

  @Test
  public void aChangedRendererTemplateIsRebuiltToo() throws Exception {
    mojo(false).start();

    Files.writeString(
        assets.resolve("_index.html"),
        "<html><head><title>New AQUIELTITULODELAPAGINA</title></head><body></body></html>");

    eventually(
        () -> {
          try {
            return Files.readString(out.resolve("index.html")).contains("New Dev test");
          } catch (Exception e) {
            return false;
          }
        });
  }

  @Test
  public void filteredResourcesAreLeftToMavenAndTargetPathsAreHonoured() throws Exception {
    var dev = mojo(false);
    var filtered = new Resource();
    filtered.setDirectory(tmp.newFolder("filtered").toString());
    filtered.setFiltering(true);
    Files.writeString(Path.of(filtered.getDirectory(), "app.properties"), "v=${project.version}");
    var moved = new Resource();
    moved.setDirectory(tmp.newFolder("moved").toString());
    moved.setTargetPath("extra");
    Files.writeString(Path.of(moved.getDirectory(), "notes.txt"), "notes");
    var build = ((MavenProject) field(dev, "project")).getBuild();
    build.addResource(filtered);
    build.addResource(moved);

    dev.start();

    assertThat(classes.resolve("app.properties")).doesNotExist();
    assertThat(classes.resolve("extra/notes.txt")).hasContent("notes");
  }

  @Test
  public void executeRunsUntilStopped() throws Exception {
    var dev = mojo(true);
    var failure = new java.util.concurrent.atomic.AtomicReference<Throwable>();
    var running =
        new Thread(
            () -> {
              try {
                dev.execute();
              } catch (Throwable t) {
                failure.set(t);
              }
            });
    running.start();
    eventually(() -> dev.port() > 0);
    assertThat(running.isAlive()).isTrue();

    dev.stop();

    running.join(10_000);
    assertThat(running.isAlive()).isFalse();
    assertThat(failure.get()).isNull();
  }

  @Test
  public void aFailureIsDescribedDownToItsCause() {
    var failure =
        new org.apache.maven.plugin.MojoExecutionException(
            "mateu-bundle failed", new IllegalStateException("bad yaml in home.yaml"));
    assertThat(DevMojo.describe(failure))
        .isEqualTo("mateu-bundle failed\n  caused by: bad yaml in home.yaml");
  }

  private static Object field(Object target, String name) throws Exception {
    var field = BundleMojo.class.getDeclaredField(name);
    field.setAccessible(true);
    return field.get(target);
  }

  /** Collects the {@code event:} lines of the live-reload stream. */
  private void listen(BlockingQueue<String> events) {
    var thread =
        new Thread(
            () -> {
              try {
                var connection =
                    (HttpURLConnection)
                        URI.create("http://localhost:" + mojo.port() + DevServer.EVENTS_PATH)
                            .toURL()
                            .openConnection();
                try (var reader =
                    new BufferedReader(
                        new InputStreamReader(
                            connection.getInputStream(), StandardCharsets.UTF_8))) {
                  for (var line = reader.readLine(); line != null; line = reader.readLine()) {
                    if (line.startsWith("event:")) {
                      events.add(line);
                    }
                  }
                }
              } catch (Exception e) {
                // the server stopped
              }
            });
    thread.setDaemon(true);
    thread.start();
  }
}
