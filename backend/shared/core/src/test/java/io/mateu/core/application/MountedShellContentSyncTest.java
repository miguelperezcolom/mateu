package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Enumeration;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

/**
 * A YAML mount below the host root ({@code basePath: /shop}) with a data-authored app shell and a
 * {@code home:}: a fresh deep link answers the SHELL aimed at the route; the shell's CONTENT load
 * of the mount root answers the home page; a plain definition keeps the bare-layout wire; and a
 * parameterised route seeds its path, fixed, default and state params into the page state.
 */
class MountedShellContentSyncTest {

  static final ObjectMapper JSON = new ObjectMapper().findAndRegisterModules();

  static final class SpecsOverlay extends ClassLoader {
    private final URLClassLoader specs;

    SpecsOverlay(String fixture, ClassLoader parent) {
      super(parent);
      URL root = MountedShellContentSyncTest.class.getResource("/s1-f4/" + fixture + "/");
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

  private static <T> T over(String fixture, Function<TestMateu, T> body) {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new SpecsOverlay(fixture, MountedShellContentSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return body.apply(mateu);
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static String load(String route, String consumed) {
    return over(
        "shop",
        mateu ->
            JSON.valueToTree(
                    mateu.run(
                        RunActionRqDto.builder()
                            .route(route)
                            .consumedRoute(consumed)
                            .actionId("")
                            .build()))
                .toString());
  }

  private static com.fasterxml.jackson.databind.JsonNode component(String json) {
    try {
      return JSON.readTree(json).at("/fragments/0/component");
    } catch (Exception e) {
      throw new AssertionError(e);
    }
  }

  @Test
  void aFreshDeepLinkAnswersTheShellAimedAtTheRoute() {
    var app = component(load("/shop/orders", "_empty"));
    assertThat(app.at("/metadata/type").asText()).isEqualTo("App");
    assertThat(app.at("/metadata/title").asText()).isEqualTo("Shop");
    assertThat(app.at("/metadata/homeRoute").asText()).isEqualTo("/shop/orders");
  }

  @Test
  void theFreshMountRootAimsTheShellAtTheMountRoot() {
    // the shell then loads the mount root as content, which answers the home page (next test)
    var app = component(load("/shop", "_empty"));
    assertThat(app.at("/metadata/type").asText()).isEqualTo("App");
    assertThat(app.at("/metadata/homeRoute").asText()).isEqualTo("/shop");
  }

  @Test
  void theShellsContentLoadOfTheMountRootIsTheHomePage() {
    var json = load("/shop", "/shop");
    assertThat(json).contains("Shop dashboard").doesNotContain("\"type\":\"App\"");
  }

  @Test
  void aStaticDefinitionKeepsTheBareLayoutWire() {
    var page = component(load("/shop/orders", "/shop"));
    assertThat(page.path("type").asText()).isEqualTo("ClientSide");
    assertThat(page.at("/metadata/type").asText()).isEqualTo("VerticalLayout");
  }

  @Test
  void aParameterisedRouteSeedsPathFixedDefaultAndStateParams() {
    var page = component(load("/shop/orders/open", "/shop"));
    assertThat(page.path("type").asText()).isEqualTo("ServerSide");
    var data = page.path("initialData");
    assertThat(data.path("status").asText()).isEqualTo("open");
    assertThat(data.path("region").asText()).isEqualTo("EU");
    assertThat(data.path("size").asText()).isEqualTo("20");
    assertThat(data.path("greeting").asText()).isEqualTo("hello");
  }
}
