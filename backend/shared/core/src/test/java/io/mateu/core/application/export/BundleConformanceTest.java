package io.mateu.core.application.export;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.testutil.TestMateu;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

/**
 * The Java half of the BUNDLE conformance corpus ({@code conformance/bundle/README.md}): each case
 * is a {@code specs/ui} directory every backend reads as it is, and {@code manifest.json} is the
 * normalised manifest the three exporters must write for it ({@code mateu-bundle:bundle}, {@code
 * python -m mateu_ui.bundle}, {@code dotnet mateu-bundle}).
 *
 * <p>Java is the reference: {@code -Dconformance.write=true} regenerates the golden, which is then
 * frozen like the wire corpus.
 */
class BundleConformanceTest {

  static final List<String> CASES = List.of("yaml-shell");

  /** Each case bundled twice: pre-rendered ({@code manifest.json}) and in specs mode. */
  static final List<java.util.Map.Entry<String, Boolean>> GOLDENS =
      CASES.stream()
          .flatMap(
              c ->
                  java.util.stream.Stream.of(
                      java.util.Map.entry(c, false), java.util.Map.entry(c, true)))
          .toList();

  static String goldenFile(boolean specsOnly) {
    return specsOnly ? "manifest-specs-only.json" : "manifest.json";
  }

  static Path corpus() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../conformance/bundle")
        .normalize();
  }

  /**
   * Serves {@code specs/ui/**} from one case directory and hides the test classpath's route index,
   * so the exporter sees the case and nothing else.
   */
  static final class CaseLoader extends ClassLoader {
    private final URLClassLoader specs;

    CaseLoader(Path root, ClassLoader parent) throws IOException {
      super(parent);
      this.specs = new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    private static boolean isIndex(String name) {
      return name.startsWith("META-INF/mateu/") && name.endsWith("-registrations");
    }

    @Override
    public URL getResource(String name) {
      if (isIndex(name)) return null;
      return isSpec(name) ? specs.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      if (isIndex(name)) return Collections.emptyEnumeration();
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }

  private static final ObjectMapper JSON =
      new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);

  /** The raw manifest Java writes for {@code name} (exactly what BundleWriter puts on disk). */
  static JsonNode rawManifest(String name) throws Exception {
    return rawManifest(name, false);
  }

  /**
   * As {@link #rawManifest(String)}; {@code specsOnly} ships the expandable definitions raw instead
   * of pre-rendering them (the goal's {@code -Dmateu.bundle.specsOnly=true}).
   */
  static JsonNode rawManifest(String name, boolean specsOnly) throws Exception {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    var loader =
        new CaseLoader(corpus().resolve(name), BundleConformanceTest.class.getClassLoader());
    thread.setContextClassLoader(loader);
    try (var mateu = TestMateu.withUis()) {
      var manifest =
          new MateuBundleExporter(mateu.service()).exportAll("", loader, true, true, specsOnly);
      var wire = MateuBundleExporter.defaultWireMapper();
      return wire.readTree(wire.writeValueAsString(manifest));
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  /**
   * What the corpus pins of a manifest: every member, with each entry's wire JSON parsed and run
   * through the WIRE normaliser (the same rules as {@code conformance/cases}), the build time
   * dropped, and the entries sorted by route (their order is the discovery order, a detail).
   */
  static JsonNode normalisedManifest(JsonNode raw) throws IOException {
    var copy = (ObjectNode) raw.deepCopy();
    copy.remove("generatedAt");
    var entries = JSON.createArrayNode();
    var sorted = new java.util.ArrayList<JsonNode>();
    raw.path("entries").forEach(sorted::add);
    sorted.sort(java.util.Comparator.comparing(e -> e.path("route").asText()));
    for (var entry : sorted) {
      var e = (ObjectNode) entry.deepCopy();
      for (var key : List.of("json", "contentJson")) {
        if (e.hasNonNull(key)) {
          e.set(key, JSON.readTree(e.get(key).asText()));
        }
      }
      entries.add(e);
    }
    copy.set("entries", entries);
    return sortedKeys(io.mateu.core.application.WireConformanceAccess.normalise(copy));
  }

  private static JsonNode sortedKeys(JsonNode node) {
    if (node.isObject()) {
      var out = JSON.createObjectNode();
      var names = new TreeSet<String>();
      node.fieldNames().forEachRemaining(names::add);
      for (var n : names) out.set(n, sortedKeys(node.get(n)));
      return out;
    }
    if (node.isArray()) {
      ArrayNode out = JSON.createArrayNode();
      node.forEach(c -> out.add(sortedKeys(c)));
      return out;
    }
    return node;
  }

  @Test
  void theReferenceProducesTheBundleCorpus() throws Exception {
    var write = Boolean.getBoolean("conformance.write");
    for (var golden : GOLDENS) {
      var name = golden.getKey();
      var specsOnly = golden.getValue();
      var raw = rawManifest(name, specsOnly);
      var actual = normalisedManifest(raw);
      var file = corpus().resolve(name).resolve(goldenFile(specsOnly));
      if (Boolean.getBoolean("conformance.dumpRaw")) {
        Files.writeString(
            Path.of(System.getProperty("java.io.tmpdir"), name + "-" + goldenFile(specsOnly)),
            JSON.writeValueAsString(raw));
      }
      if (write) {
        Files.writeString(file, JSON.writeValueAsString(actual) + "\n");
      }
      assertThat(Files.isRegularFile(file))
          .as("golden for '%s' (generate it with -Dconformance.write=true)", name)
          .isTrue();
      assertThat(actual)
          .as("bundle case '%s' — the reference no longer produces what the corpus pins", name)
          .isEqualTo(JSON.readTree(Files.readString(file)));
    }
  }

  @Test
  void theYamlShellCaseBundlesBothLoadsOfASubRoute() throws Exception {
    var raw = rawManifest("yaml-shell");
    var routes = new TreeSet<String>();
    raw.path("entries").forEach(e -> routes.add(e.path("route").asText()));
    assertThat(routes).containsAll(Set.of("/", "/hello", "/about"));
    for (var e : raw.path("entries")) {
      if (e.path("route").asText().equals("/hello")) {
        assertThat(e.path("contentJson").asText()).contains("Bundled hello page");
      }
    }
  }
}
