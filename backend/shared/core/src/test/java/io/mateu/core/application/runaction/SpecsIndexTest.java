package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.i18n.TranslationRegistry;
import io.mateu.core.infra.dev.DevSpecs;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Enumeration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

/**
 * The specs index: the file kinds discovered by their {@code type:} header (mounts, route files,
 * the project descriptor, action catalogues, field types, translations, environments) share ONE
 * walk of the classpath and ONE parse per file. Before the index, building them walked {@code
 * specs/ui} seven times and parsed every file seven times.
 *
 * <p>Counted on the classloader itself, so the numbers belong to this test alone.
 */
class SpecsIndexTest {

  /** A classloader over a temp dir that counts the walks and the reads of each spec file. */
  static final class CountingLoader extends URLClassLoader {
    final AtomicInteger walks = new AtomicInteger();
    final Map<String, AtomicInteger> reads = new ConcurrentHashMap<>();

    CountingLoader(Path root) throws Exception {
      super(new URL[] {root.toUri().toURL()}, null);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      if ("specs/ui".equals(name)) {
        walks.incrementAndGet();
      }
      return super.getResources(name);
    }

    @Override
    public InputStream getResourceAsStream(String name) {
      if (name.startsWith("specs/ui/")) {
        reads.computeIfAbsent(name, k -> new AtomicInteger()).incrementAndGet();
      }
      return super.getResourceAsStream(name);
    }
  }

  private static Path specs() throws Exception {
    var root = Files.createTempDirectory("specs-index");
    var ui = Files.createDirectories(root.resolve("specs/ui"));
    Files.writeString(
        ui.resolve("shop.ui.yaml"), "type: UI\nbasePath: /shop\nroutes:\n  - shop-routes.yaml\n");
    Files.writeString(
        ui.resolve("shop-routes.yaml"),
        "type: Routes\nbasePath: /shop\nroutes:\n  - route: orders\n    layout: orders.yaml\n");
    Files.writeString(ui.resolve("project.yaml"), "type: Project\nrenderer: vaadin\n");
    Files.writeString(
        ui.resolve("more-actions.yaml"),
        "type: Actions\nactions:\n  - id: ping\n    restAction:\n      source:\n        url: /ping\n");
    Files.writeString(
        ui.resolve("more-types.yaml"),
        "type: Types\ntypes:\n  - id: email\n    dataType: string\n");
    Files.createDirectories(ui.resolve("translations"));
    Files.writeString(ui.resolve("translations/es.yaml"), "messages:\n  hello: Hola\n");
    Files.createDirectories(ui.resolve("environments"));
    Files.writeString(
        ui.resolve("environments/staging.yaml"),
        "sources:\n  countries:\n    baseUrl: https://staging.example.com\n");
    Files.writeString(ui.resolve("orders.yaml"), "layout:\n  type: Text\n  text: Orders\n");
    return root;
  }

  /** Builds every registry that discovers files by their type. */
  private static void buildEveryRegistry(ClassLoader cl) {
    var mounts = new MountRegistry();
    assertThat(mounts.mounts(cl)).extracting(MountRegistry.Mount::basePath).containsExactly("shop");
    assertThat(mounts.routeFileMounts(cl))
        .extracting(MountRegistry.RouteFileMount::resourcePath)
        .containsExactly("specs/ui/shop-routes.yaml");
    assertThat(mounts.projectDescriptors(cl)).containsExactly("specs/ui/project.yaml");
    assertThat(new ActionRegistry().authoredFrom(cl).actions())
        .extracting(a -> a.id())
        .containsExactly("ping");
    assertThat(new FieldTypeRegistry().authoredFrom(cl).types())
        .extracting(t -> t.id())
        .containsExactly("email");
    assertThat(new TranslationRegistry().authoredFrom(cl))
        .extracting(t -> t.locale())
        .containsExactly("es");
    assertThat(Environments.all(cl)).containsOnlyKeys("staging");
  }

  @Test
  void everyRegistryReadsTheSpecsFromOneWalkAndOneParsePerFile() throws Exception {
    try (var cl = new CountingLoader(specs())) {
      buildEveryRegistry(cl);

      assertThat(cl.walks.get()).isEqualTo(1);
      assertThat(cl.reads).hasSize(8);
      assertThat(cl.reads.values()).allSatisfy(n -> assertThat(n.get()).isEqualTo(1));
    }
  }

  @Test
  void aSecondBuildReadsNothingAgain() throws Exception {
    try (var cl = new CountingLoader(specs())) {
      buildEveryRegistry(cl);
      buildEveryRegistry(cl);

      assertThat(cl.walks.get()).isEqualTo(1);
      assertThat(cl.reads.values()).allSatisfy(n -> assertThat(n.get()).isEqualTo(1));
    }
  }

  @Test
  void invalidatingTheSpecsWalksAgainAndSeesANewFile() throws Exception {
    var root = specs();
    try (var cl = new CountingLoader(root)) {
      assertThat(new ActionRegistry().authoredFrom(cl).actions()).hasSize(1);

      Files.writeString(
          root.resolve("specs/ui/late-actions.yaml"),
          "type: Actions\nactions:\n  - id: pong\n    restAction:\n      source:\n        url: /p\n");
      // outside dev mode nothing changes the classpath: the index stands
      assertThat(new ActionRegistry().authoredFrom(cl).actions()).hasSize(1);

      DevSpecs.invalidateAll();

      assertThat(new ActionRegistry().authoredFrom(cl).actions())
          .extracting(a -> a.id())
          .containsExactlyInAnyOrder("ping", "pong");
      assertThat(cl.walks.get()).isEqualTo(2);
    }
  }

  @Test
  void aReaderGetsItsOwnCopyOfTheTree() throws Exception {
    try (var cl = new CountingLoader(specs())) {
      var index = SpecsIndex.of(cl);
      var first =
          (com.fasterxml.jackson.databind.node.ObjectNode) index.tree("specs/ui/project.yaml");
      first.put("renderer", "redwood");

      assertThat(index.tree("specs/ui/project.yaml").get("renderer").asText()).isEqualTo("vaadin");
      assertThat(index.type("specs/ui/project.yaml")).isEqualTo("Project");
      assertThat(index.type("specs/ui/orders.yaml")).isEmpty();
      assertThat(index.type("specs/ui/missing.yaml")).isEmpty();
      assertThat(index.tree("specs/ui/missing.yaml")).isNull();
    }
  }

  @Test
  void aFileThatDoesNotParseFailsForEachReader() throws Exception {
    var root = specs();
    Files.writeString(root.resolve("specs/ui/broken.yaml"), "type: [unclosed\n");
    try (var cl = new CountingLoader(root)) {
      var index = SpecsIndex.of(cl);

      assertThat(index.type("specs/ui/broken.yaml")).isEmpty();
      assertThatThrownBy(() -> index.tree("specs/ui/broken.yaml")).isInstanceOf(IOException.class);
      assertThatThrownBy(() -> index.tree("specs/ui/broken.yaml")).isInstanceOf(IOException.class);
      // the other files are unaffected
      buildEveryRegistry(cl);
    }
  }

  @Test
  void aConventionalFileTheWalkDidNotListIsStillRead() throws Exception {
    try (var cl = new CountingLoader(specs())) {
      // a path outside specs/ui is never in the index: read directly
      assertThat(SpecsIndex.treeOf(cl, "specs/ui/project.yaml").get("type").asText())
          .isEqualTo("Project");
      assertThat(SpecsIndex.treeOf(cl, "nowhere/else.yaml")).isNull();
    }
  }
}
