package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.function.Function;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * A {@code type: UI} mount names its home page ({@code home: dashboard}).
 *
 * <ul>
 *   <li>Without an app shell the mount ROOT renders the home route — unless a route {@code ""} is
 *       authored, which always wins (explicit beats derived).
 *   <li>With an app shell bound to {@code ""} the shell's {@code homeRoute} defaults to the home;
 *       the shell's own {@code homeRoute:} still wins.
 *   <li>A home that names no route is warned about and ignored — the old behaviour.
 * </ul>
 *
 * <p>Each case is a fixture under {@code mount-home/<case>/specs/ui}, served through a class loader
 * that answers {@code specs/ui/**} ONLY from that directory, so the shared test {@code specs/ui}
 * neither leaks in nor is changed for the other suites.
 */
class MountHomeSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  /** Serves {@code specs/ui/**} from one fixture directory; everything else from the parent. */
  static final class SpecsOverlay extends ClassLoader {
    private final URLClassLoader specs;

    SpecsOverlay(String fixture, ClassLoader parent) {
      super(parent);
      URL root = MountHomeSyncTest.class.getResource("/mount-home/" + fixture + "/");
      this.specs = new URLClassLoader(new URL[] {root}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    @Override
    public URL getResource(String name) {
      return isSpec(name) ? specs.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }

  private static <T> T over(String fixture, Function<ClassLoader, T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    var overlay = new SpecsOverlay(fixture, MountHomeSyncTest.class.getClassLoader());
    thread.setContextClassLoader(overlay);
    try {
      return body.apply(overlay);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  /** A fresh deep link to {@code route}, as wire JSON. */
  private static JsonNode load(String fixture, String route) {
    return over(
        fixture,
        cl -> {
          try (var mateu = TestMateu.withUis()) {
            UIIncrementDto increment =
                mateu.run(
                    RunActionRqDto.builder()
                        .route(route)
                        .consumedRoute("_empty")
                        .actionId("")
                        .build());
            return JSON.valueToTree(increment);
          }
        });
  }

  private static String homeRouteOf(JsonNode wire) {
    var values = wire.findValues("homeRoute");
    return values.isEmpty() ? null : values.get(0).asText();
  }

  @Test
  void withoutAShellTheMountRootRendersTheHomePage() {
    var wire = load("plain", "/").toString();
    assertThat(wire).contains("Mount home dashboard").doesNotContain("Mount home orders");
  }

  @Test
  void theHomeRouteKeepsAnsweringOnItsOwnPath() {
    assertThat(load("plain", "/dashboard").toString()).contains("Mount home dashboard");
    assertThat(load("plain", "/orders").toString()).contains("Mount home orders");
  }

  @Test
  void anAuthoredRootRouteWinsOverTheHome() {
    var wire = load("authored-root", "/").toString();
    assertThat(wire).contains("Authored root").doesNotContain("Mount home dashboard");
  }

  @Test
  void aShellWithoutItsOwnHomeRouteLandsOnTheMountHome() {
    // Without the mount's home the shell would land on its first menu item, `orders`.
    assertThat(homeRouteOf(load("shell", "/"))).isEqualTo("dashboard");
  }

  @Test
  void aShellsOwnHomeRouteWinsOverTheMountHome() {
    assertThat(homeRouteOf(load("shell-own-home", "/"))).isEqualTo("orders");
  }

  @Test
  void anUnknownHomeIsWarnedAboutAndIgnored() {
    var logger = (Logger) LoggerFactory.getLogger(RouteRegistry.class);
    var logs = new ListAppender<ILoggingEvent>();
    logs.start();
    logger.addAppender(logs);
    try {
      // The old behaviour: the shell lands on its first navigable menu item.
      assertThat(homeRouteOf(load("unknown", "/"))).isEqualTo("orders");
    } finally {
      logger.detachAppender(logs);
    }
    assertThat(logs.list)
        .filteredOn(e -> e.getFormattedMessage().contains("'nowhere'"))
        .singleElement()
        .satisfies(
            e -> {
              assertThat(e.getLevel().toString()).isEqualTo("WARN");
              assertThat(e.getFormattedMessage()).contains("app.ui.yaml");
            });
    var table = over("unknown", cl -> new RouteRegistry().authoredFrom(cl));
    assertThat(table.match("").orElseThrow().entry().definition()).isEqualTo("shell.yaml");
  }

  @Test
  void theAuthoredTableAliasesTheRootToTheHomeEntry() {
    var registry = new RouteRegistry();
    var table = over("plain", registry::authoredFrom);
    var root = table.match("").orElseThrow().entry();
    assertThat(root.definition()).isEqualTo("dashboard.yaml");
    assertThat(registry.mountHomes()).containsEntry("", "dashboard");
  }

  @Test
  void aBundleShipsTheMountHomeInsideAShellThatDeclaresNone() {
    var registry = new RouteRegistry();
    var table = over("shell", registry::authoredFrom);
    var definitions = new java.util.LinkedHashMap<String, JsonNode>();
    definitions.put(
        "shell.yaml", JSON.createObjectNode().put("type", "AppShell").put("title", "Mount home"));
    MateuBundleExporter.stampMountHomes(registry.mountHomes(), table, definitions);
    assertThat(definitions.get("shell.yaml").path("homeRoute").asText()).isEqualTo("dashboard");

    var own = new java.util.LinkedHashMap<String, JsonNode>();
    own.put("shell.yaml", JSON.createObjectNode().put("type", "AppShell").put("homeRoute", "x"));
    MateuBundleExporter.stampMountHomes(registry.mountHomes(), table, own);
    assertThat(own.get("shell.yaml").path("homeRoute").asText()).isEqualTo("x");
  }
}
