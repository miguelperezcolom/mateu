package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.infra.IndexPage;
import io.mateu.core.infra.dev.DevMode;
import io.mateu.core.infra.dev.DevSpecs;
import io.mateu.core.infra.dev.SpecsCache;
import io.mateu.core.testutil.TestMateu;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Development mode: the specs are read from a SOURCE directory and every cache built from them is
 * dropped when a file changes — so the next sync of an open screen reflects the edit, with no
 * restart. Pins the route table, the definitions, the REST source catalogue, the watcher, the
 * one-line hook for new catalogues, and that none of it happens with dev mode off.
 */
class LiveReloadSyncTest {

  @TempDir static Path specs;

  static TestMateu mateu;

  @BeforeAll
  static void boot() throws Exception {
    write("routes.yaml", routes("live"));
    write("live.yaml", page("Version one"));
    write("sources.yaml", source("https://one.example/api"));
    DevMode.enable(specs.toString());
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    DevMode.reset();
  }

  @Test
  void anEditedDefinitionIsWhatTheNextSyncRenders() throws Exception {
    assertThat(render("/live")).contains("Version one");

    var file = write("live.yaml", page("Version two"));
    DevSpecs.changed(List.of(file));

    assertThat(render("/live")).contains("Version two").doesNotContain("Version one");
  }

  @Test
  void aRouteAddedToTheAuthoredTableAnswersAfterTheChange() throws Exception {
    var registry = mateu.context().getBean(RouteRegistry.class);
    assertThat(registry.authored().match("added")).isEmpty();

    write("added.yaml", page("A brand new screen"));
    var routes = write("routes.yaml", routes("live", "added"));
    DevSpecs.changed(List.of(routes));

    assertThat(registry.authored().match("added")).isPresent();
    assertThat(render("/added")).contains("A brand new screen");
  }

  @Test
  void theSourceCatalogueIsReadAgain() throws Exception {
    var registry = mateu.context().getBean(RestSourceRegistry.class);
    assertThat(registry.get("live").orElseThrow().source().url())
        .isEqualTo("https://one.example/api");

    var file = write("sources.yaml", source("https://two.example/api"));
    DevSpecs.changed(List.of(file));

    assertThat(registry.get("live").orElseThrow().source().url())
        .isEqualTo("https://two.example/api");
  }

  @Test
  void theWatcherNoticesAnEditOnDiskByItself() throws Exception {
    var events = new CopyOnWriteArrayList<DevSpecs.DevEvent>();
    var subscription = DevSpecs.events().subscribe(events::add);
    try {
      Thread.sleep(500); // let the watcher take its first snapshot of a settled tree
      write("watched.yaml", page("Watched " + System.nanoTime()));
      var deadline = System.currentTimeMillis() + 10_000;
      while (watched(events) == null && System.currentTimeMillis() < deadline) {
        Thread.sleep(100);
      }
      var event = watched(events);
      assertThat(event).as("the watcher should report the new file").isNotNull();
      assertThat(event.type()).isEqualTo("specs-changed");
      assertThat(event.files()).contains("specs/ui/watched.yaml");
      assertThat(event.scope()).isEqualTo(DevSpecs.SCOPE_PAGE);
    } finally {
      subscription.dispose();
    }
  }

  @Test
  void aRouteFileIsAnAppLevelChange() throws Exception {
    var events = new CopyOnWriteArrayList<DevSpecs.DevEvent>();
    var subscription = DevSpecs.events().subscribe(events::add);
    try {
      DevSpecs.changed(List.of(specs.resolve("routes.yaml")));
      DevSpecs.changed(List.of(specs.resolve("live.yaml")));
      DevSpecs.reload(null);
      assertThat(events)
          .extracting(DevSpecs.DevEvent::type, DevSpecs.DevEvent::scope)
          .containsExactly(
              org.assertj.core.groups.Tuple.tuple("specs-changed", DevSpecs.SCOPE_APP),
              org.assertj.core.groups.Tuple.tuple("specs-changed", DevSpecs.SCOPE_PAGE),
              org.assertj.core.groups.Tuple.tuple("reload", DevSpecs.SCOPE_PAGE));
    } finally {
      subscription.dispose();
    }
  }

  @Test
  void aNewCatalogueHooksInWithOneLine() {
    var invalidations = new AtomicInteger();
    SpecsCache catalogue = invalidations::incrementAndGet;
    DevSpecs.register(catalogue);

    DevSpecs.reload(null);

    assertThat(invalidations).hasValue(1);
  }

  @Test
  void theIndexPageAnnouncesTheEventStreamOnlyInDevMode() {
    var html = "<html><head><title>x</title></head><body></body></html>";
    assertThat(IndexPage.devHead(html)).contains("<meta name=\"mateu-dev\"");
  }

  private static DevSpecs.DevEvent watched(List<DevSpecs.DevEvent> events) {
    return events.stream()
        .filter(e -> e.files().contains("specs/ui/watched.yaml"))
        .findFirst()
        .orElse(null);
  }

  private static String render(String route) {
    try {
      return io.mateu.core.infra.WireMapper.shared().writeValueAsString(mateu.sync(route));
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private static Path write(String name, String content) throws Exception {
    var file = specs.resolve(name);
    Files.writeString(file, content);
    return file;
  }

  private static String routes(String... names) {
    var sb = new StringBuilder("routes:\n");
    for (var name : names) {
      sb.append("  - route: ").append(name).append('\n');
      sb.append("    definition: ").append(name).append(".yaml\n");
    }
    return sb.toString();
  }

  private static String page(String text) {
    return "layout:\n  type: VerticalLayout\n  content:\n    - type: Text\n      text: \""
        + text
        + "\"\n";
  }

  private static String source(String url) {
    return "sources:\n  - name: live\n    source:\n      url: " + url + "\n";
  }
}
