package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertThrows;

import com.sun.net.httpserver.HttpServer;
import java.io.File;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugin.logging.SystemStreamLog;
import org.junit.Assume;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

/**
 * {@code mateu-bundle:figma} end to end: the bundled converter run with the machine's node against
 * the Star Wars fixture (design/figma/to-yaml/test/fixtures), offline and through a local server
 * playing the Figma REST API. Skipped when no node ≥ 20 is installed. The converter's own output is
 * pinned by its golden files; this pins the goal around it — what is written, what routes.yaml
 * gains, what a re-import changes (nothing), the token and the errors.
 */
public class FigmaMojoTest {

  static final Path FIXTURE =
      Path.of("../../design/figma/to-yaml/test/fixtures/starwars.figma.json");

  @Rule public TemporaryFolder tmp = new TemporaryFolder();

  Path specs;
  Path home;

  @Before
  public void setUp() throws Exception {
    specs = tmp.newFolder("app", "src", "main", "resources", "specs", "ui").toPath();
    home = tmp.newFolder("home").toPath();
    Assume.assumeTrue("needs node >= 20", nodeAvailable());
  }

  private boolean nodeAvailable() {
    for (var c : FigmaImport.nodeCandidates(null, System.getenv(), home)) {
      if (!Files.isExecutable(c)) continue;
      try {
        var p = new ProcessBuilder(c.toString(), "--version").start();
        var v = new String(p.getInputStream().readAllBytes()).trim();
        p.waitFor();
        if (FigmaImport.nodeMajor(v).orElse(0) >= FigmaImport.MIN_NODE_MAJOR) return true;
      } catch (Exception e) {
        // next
      }
    }
    return false;
  }

  private FigmaMojo mojo(Map<String, Object> params, Map<String, String> env) throws Exception {
    var mojo = new FigmaMojo();
    mojo.setLog(new SystemStreamLog());
    Mojos.set(mojo, "out", specs.toFile());
    Mojos.set(mojo, "routes", true);
    Mojos.set(mojo, "api", "https://api.figma.com");
    var e = new java.util.HashMap<>(env);
    e.putIfAbsent("PATH", System.getenv().getOrDefault("PATH", ""));
    mojo.environment = e;
    mojo.home = home;
    for (var p : params.entrySet()) Mojos.set(mojo, p.getKey(), p.getValue());
    return mojo;
  }

  private FigmaMojo offline(Map<String, Object> more) throws Exception {
    var params = new java.util.HashMap<String, Object>(more);
    params.put("json", FIXTURE.toFile());
    return mojo(params, Map.of());
  }

  @Test
  public void writesThePagesAndRegistersThemBeforeTheMarker() throws Exception {
    Files.writeString(
        specs.resolve("routes.yaml"),
        "type: Routes\nroutes:\n  - route: \"\"\n    layout: app.yaml\n  # __ROUTES__\n");

    var m = offline(Map.of());
    m.execute();

    assertThat(specs.resolve("species.yaml")).exists();
    assertThat(specs.resolve("partials/species-list.yaml")).exists();
    assertThat(Files.readString(specs.resolve("species.yaml")))
        .isEqualTo(
            Files.readString(Path.of("../../design/figma/to-yaml/test/golden/species.yaml")));
    var routes = Files.readString(specs.resolve("routes.yaml"));
    assertThat(routes)
        .startsWith("type: Routes\nroutes:\n  - route: \"\"\n    layout: app.yaml\n  - route: ");
    assertThat(routes).endsWith("  # __ROUTES__\n");
    assertThat(routes).contains("  - route: species\n    layout: species.yaml\n");
    assertThat(routes).doesNotContain("partials/");
    assertThat(m.routesAdded)
        .contains("species", "welcome", "dashboard")
        .doesNotContain("species-list");

    // a re-import changes nothing and registers nothing
    var again = offline(Map.of());
    again.execute();
    assertThat(again.written).allMatch(s -> s.startsWith("unchanged "));
    assertThat(again.routesAdded).isEmpty();
    assertThat(Files.readString(specs.resolve("routes.yaml"))).isEqualTo(routes);
  }

  @Test
  public void createsRoutesYamlWhenTheMountHasNone() throws Exception {
    offline(Map.of("frames", "species, Welcome")).execute();

    var routes = Files.readString(specs.resolve("routes.yaml"));
    assertThat(routes)
        .contains(
            "type: Routes\nroutes:\n  - route: welcome\n    layout: welcome.yaml\n  - route: species\n    layout: species.yaml\n");
    try (var files = Files.list(specs)) {
      assertThat(files.map(p -> p.getFileName().toString()).sorted().toList())
          .containsExactly("partials", "routes.yaml", "species.yaml", "welcome.yaml");
    }
  }

  @Test
  public void aSubFolderOfSpecsUiKeepsItsFolderInRouteAndLayout() throws Exception {
    Files.writeString(specs.resolve("routes.yaml"), "type: Routes\nroutes: []\n");
    var sub = specs.resolve("starwars");
    var params = new java.util.HashMap<String, Object>(Map.of("frames", "species"));
    params.put("json", FIXTURE.toFile());
    var m = mojo(params, Map.of());
    Mojos.set(m, "out", sub.toFile());
    m.execute();
    assertThat(Files.readString(specs.resolve("routes.yaml")))
        .isEqualTo(
            "type: Routes\nroutes:\n  - route: starwars/species\n    layout: starwars/species.yaml\n");
  }

  @Test
  public void aDryRunWritesNothing() throws Exception {
    var m = offline(Map.of("dryRun", true));
    m.execute();
    try (var files = Files.list(specs)) {
      assertThat(files.toList()).isEmpty();
    }
    assertThat(m.written).allMatch(s -> s.startsWith("created "));
    assertThat(m.routesAdded).contains("species");
  }

  @Test
  public void aHandWrittenFileIsLeftAloneUnlessForced() throws Exception {
    Files.writeString(specs.resolve("species.yaml"), "type: Form\ntitle: mine\n");
    var m = offline(Map.of("frames", "species"));
    m.execute();
    assertThat(Files.readString(specs.resolve("species.yaml")))
        .isEqualTo("type: Form\ntitle: mine\n");
    assertThat(m.written).contains("skipped species.yaml");
    assertThat(m.warnings)
        .anyMatch(w -> w.contains("species.yaml") && w.contains("not generated from Figma"));

    offline(Map.of("frames", "species", "force", true)).execute();
    assertThat(Files.readString(specs.resolve("species.yaml")))
        .contains("Generated from the Figma frame");
  }

  @Test
  public void anUnknownFrameListsTheOnesThereAre() throws Exception {
    var e =
        assertThrows(MojoFailureException.class, () -> offline(Map.of("frames", "nope")).execute());
    assertThat(e.getMessage()).contains("No frame called \"nope\"").contains("species");
  }

  @Test
  public void fetchesTheFileWithTheTokenFromTheSecretsFile() throws Exception {
    Files.createDirectories(home.resolve(".mateu-secrets"));
    Files.writeString(home.resolve(".mateu-secrets/figma-token"), "figd_secret\n");
    var seen = new AtomicReference<String>();
    var path = new AtomicReference<String>();
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var body = Files.readAllBytes(FIXTURE);
    server.createContext(
        "/",
        ex -> {
          seen.set(ex.getRequestHeaders().getFirst("X-Figma-Token"));
          path.set(ex.getRequestURI().getPath());
          ex.sendResponseHeaders(200, body.length);
          ex.getResponseBody().write(body);
          ex.close();
        });
    server.start();
    try {
      var m =
          mojo(
              Map.of(
                  "file", "https://www.figma.com/design/AbCdEf123456XyZ/Star-Wars?node-id=1-2",
                  "frames", "species",
                  "api", "http://127.0.0.1:" + server.getAddress().getPort()),
              Map.of());
      m.execute();
      assertThat(seen.get()).isEqualTo("figd_secret");
      assertThat(path.get()).isEqualTo("/v1/files/AbCdEf123456XyZ");
      assertThat(specs.resolve("species.yaml")).exists();
    } finally {
      server.stop(0);
    }
  }

  @Test
  public void aRefusedTokenSaysHowToCreateOne() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    server.createContext(
        "/",
        ex -> {
          ex.sendResponseHeaders(403, -1);
          ex.close();
        });
    server.start();
    try {
      var m =
          mojo(
              Map.of(
                  "file",
                  "AbCdEf123456XyZ",
                  "api",
                  "http://127.0.0.1:" + server.getAddress().getPort()),
              Map.of("FIGMA_TOKEN", "figd_expired"));
      var e = assertThrows(MojoFailureException.class, m::execute);
      assertThat(e.getMessage())
          .contains("HTTP 403")
          .contains("File content: Read only")
          .doesNotContain("figd_expired");
    } finally {
      server.stop(0);
    }
  }

  @Test
  public void aMissingNodeIsAClearError() throws Exception {
    var m = offline(Map.of("node", new File(tmp.getRoot(), "no-node").getPath()));
    var e = assertThrows(MojoFailureException.class, m::execute);
    assertThat(e.getMessage()).contains("Node.js 20 or newer").contains("-Dfigma.node");
  }
}
