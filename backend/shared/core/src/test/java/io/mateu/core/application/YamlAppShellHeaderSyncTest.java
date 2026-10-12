package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpServer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Function;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The header extras of an {@code @App} class — {@code @AppContext} pickers, {@code
 * AppActionsSupplier} buttons, a {@code NotificationsSupplier} inbox and a {@code
 * GlobalSearchSupplier} search — authored as data on a {@code type: AppShell}: they reach the same
 * wire fields, and a PROXIED source runs through the server's {@code _appsource} action, which only
 * calls what the shell declares.
 *
 * <p>Also the Java golden of the browser expander's {@code expandAppShell} for these keys: run with
 * {@code -Dexpander.golden.write=true} to refresh {@code app-shell-extras.golden.json}.
 */
class YamlAppShellHeaderSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  static HttpServer stub;
  static Path specs;
  static final List<String> calls = new CopyOnWriteArrayList<>();

  @BeforeAll
  static void startStub() throws Exception {
    stub = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
    stub.createContext(
        "/inbox/read",
        exchange -> {
          calls.add(exchange.getRequestMethod() + " " + exchange.getRequestURI());
          reply(exchange, "{}");
        });
    stub.createContext(
        "/inbox",
        exchange -> {
          calls.add(exchange.getRequestMethod() + " " + exchange.getRequestURI());
          reply(
              exchange,
              "{\"items\":[{\"id\":\"n1\",\"title\":\"Welcome\",\"unread\":true,\"route\":\"home\"}]}");
        });
    stub.createContext(
        "/search",
        exchange -> {
          calls.add(exchange.getRequestMethod() + " " + exchange.getRequestURI());
          reply(exchange, "[{\"label\":\"Ada\",\"route\":\"customers/1\"}]");
        });
    stub.start();
    // the fixture with the stub's port in its source urls
    specs = Files.createTempDirectory("shell-extras");
    var fixture =
        Path.of(YamlAppShellHeaderSyncTest.class.getResource("/mount-home/shell-extras/").toURI());
    try (var files = Files.walk(fixture)) {
      for (var file : files.filter(Files::isRegularFile).toList()) {
        var target = specs.resolve(fixture.relativize(file).toString());
        Files.createDirectories(target.getParent());
        Files.writeString(
            target,
            Files.readString(file)
                .replace("__PORT__", String.valueOf(stub.getAddress().getPort())));
      }
    }
  }

  @AfterAll
  static void stopStub() {
    stub.stop(0);
  }

  private static void reply(com.sun.net.httpserver.HttpExchange exchange, String body)
      throws IOException {
    var bytes = body.getBytes(StandardCharsets.UTF_8);
    exchange.getResponseHeaders().add("Content-Type", "application/json");
    exchange.sendResponseHeaders(200, bytes.length);
    try (var out = exchange.getResponseBody()) {
      out.write(bytes);
    }
  }

  /** The specs of the temp fixture, everything else from the test classpath. */
  static final class Overlay extends ClassLoader {
    private final URLClassLoader overlay;

    Overlay(Path root, ClassLoader parent) throws Exception {
      super(parent);
      this.overlay = new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    @Override
    public URL getResource(String name) {
      return isSpec(name) ? overlay.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isSpec(name) ? overlay.getResources(name) : super.getResources(name);
    }
  }

  private static <T> T withShell(Function<TestMateu, T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    try {
      thread.setContextClassLoader(
          new Overlay(specs, YamlAppShellHeaderSyncTest.class.getClassLoader()));
      try (var mateu = TestMateu.withUis()) {
        return body.apply(mateu);
      }
    } catch (RuntimeException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException(e);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static UIIncrementDto loadShell(TestMateu mateu) {
    return mateu.run(
        RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build());
  }

  private static AppDto appOf(UIIncrementDto increment) {
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    return (AppDto) component.metadata();
  }

  private static JsonNode appSource(TestMateu mateu, Map<String, Object> parameters) {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/")
                .consumedRoute("/")
                .actionId("_appsource")
                .parameters(parameters)
                .build());
    return JSON.valueToTree(increment.appData());
  }

  @Test
  void contextPickersReachTheWireWithStaticOptionsOrASource() throws Exception {
    var increment = withShell(YamlAppShellHeaderSyncTest::loadShell);
    var app = appOf(increment);
    assertThat(app.contextSelectors()).hasSize(2);
    var hotel = app.contextSelectors().get(0);
    assertThat(hotel.fieldName()).isEqualTo("hotel");
    assertThat(hotel.label()).isEqualTo("Hotel");
    assertThat(hotel.options()).extracting(o -> o.value()).containsExactly("H1", "H2");
    assertThat(hotel.optionsSource()).isNull();
    var company = app.contextSelectors().get(1);
    // no label: the field name, humanized — as @AppContext does
    assertThat(company.label()).isEqualTo("Company");
    assertThat(company.options()).isEmpty();
    assertThat(company.optionsSource().ref()).isEqualTo("companies");
    maybeWriteGolden(increment);
  }

  @Test
  void headerActionsNavigateOrRunAShellActionAndNest() {
    var app = appOf(withShell(YamlAppShellHeaderSyncTest::loadShell));
    var actions = app.contextActions();
    assertThat(actions).hasSize(3);
    assertThat(actions.get(0).actionId()).isEqualTo("newBooking");
    assertThat(actions.get(0).icon()).isEqualTo("vaadin:plus");
    // made absolute against the mount, like the menu's routes
    assertThat(actions.get(1).route()).isEqualTo("/reports");
    assertThat(actions.get(1).actionId()).isNull();
    assertThat(actions.get(2).children()).hasSize(1);
    assertThat(actions.get(2).children().get(0).route()).isEqualTo("/help");
    // the flow the first one names travels on the App, lowered, so the browser runs it
    assertThat(app.actions()).extracting(a -> a.id()).contains("newBooking");
  }

  @Test
  void theInboxAndTheSearchAreOnAndCarryTheirSources() {
    var app = appOf(withShell(YamlAppShellHeaderSyncTest::loadShell));
    assertThat(app.notificationsEnabled()).isTrue();
    assertThat(app.notificationsSource().url()).endsWith("/inbox");
    assertThat(app.notificationsSource().proxy()).isTrue();
    assertThat(app.notificationsReadSource().method()).isEqualTo("POST");
    assertThat(app.globalSearchEnabled()).isTrue();
    assertThat(app.globalSearchSource().url()).contains("/search?q=${state.searchText}");
    assertThat(app.requiredCapabilities())
        .contains("notifications", "global-search", "context-selectors", "header-actions");
  }

  @Test
  void aProxiedShellSourceIsCalledByTheServer() {
    calls.clear();
    var data =
        withShell(
            mateu -> {
              var inbox = appSource(mateu, Map.of("_appSource", "notifications"));
              var search =
                  appSource(mateu, Map.of("_appSource", "globalSearch", "searchText", "ada"));
              var read =
                  appSource(mateu, Map.of("_appSource", "notificationsRead", "ids", "n1,n2"));
              return List.of(inbox, search, read);
            });
    assertThat(data.get(0).path("_restfetch").path("items").path(0).path("title").asText())
        .as("inbox answer: %s", data.get(0))
        .isEqualTo("Welcome");
    assertThat(data.get(1).path("_restfetch").path(0).path("label").asText()).isEqualTo("Ada");
    assertThat(calls)
        .containsExactly("GET /inbox", "GET /search?q=ada", "POST /inbox/read?ids=n1%2Cn2");
  }

  @Test
  void theProxyCallsOnlyWhatTheShellDeclares() {
    calls.clear();
    var data =
        withShell(
            mateu ->
                List.of(
                    appSource(mateu, Map.of("_appSource", "somethingElse")),
                    // a picker fed by a source is served by role + field; one without is not
                    appSource(mateu, Map.of("_appSource", "contextOptions", "_field", "hotel"))));
    for (var answer : data) {
      assertThat(answer.path("_restfetchError").path("status").asInt()).isEqualTo(404);
    }
    assertThat(calls).isEmpty();
  }

  private static void maybeWriteGolden(UIIncrementDto increment) throws Exception {
    if (!Boolean.getBoolean("expander.golden.write")) return;
    Files.writeString(
        TemplateComponentsDefinitionSyncTest.FIXTURES.resolve("app-shell-extras.golden.json"),
        // the stub's port goes back to the fixture's placeholder: the browser test reads that file
        JSON.writerWithDefaultPrettyPrinter()
                .writeValueAsString(JSON.valueToTree(increment))
                .replace("localhost:" + stub.getAddress().getPort(), "localhost:__PORT__")
            + "\n");
  }
}
