package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.micronaut.context.ApplicationContext;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link MateuYamlMountController} — the surface of a deployment with no Java {@code @UI} — over
 * the YAML mount fixture ({@code specs/ui/yaml-parity.ui.yaml}: an app shell titled "YAML parity"
 * at {@code /yaml-parity} and a {@code page} route with the text "YAML parity page"). The same
 * expectations as {@code AdapterParityITFoundation.servesAYamlMount} on the other adapters. The
 * test app also has generated {@code @UI} controllers, so the controller rightly is not a bean here
 * ({@link MateuYamlMountController.Present}): it is built with the app's own beans and called
 * directly.
 */
@MicronautTest
class MateuYamlMountControllerTest {

  @Inject ApplicationContext context;
  @Inject MateuService service;
  @Inject RouteRegistry routeRegistry;
  @Inject YamlAppLoader yamlAppLoader;

  MateuYamlMountController controller;

  @BeforeEach
  void setUp() {
    controller = new MateuYamlMountController(service, routeRegistry, yamlAppLoader);
  }

  @Test
  void isNotABeanWhileTheAppHasGeneratedControllers() {
    assertThat(context.containsBean(MateuYamlMountController.class), is(false));
  }

  @Test
  void servesTheShellOfTheMountAndItsDeepLinks() {
    for (String path : new String[] {"yaml-parity", "yaml-parity/page"}) {
      var response = controller.index(path, "text/html");
      assertThat(response.status(), equalTo(HttpStatus.OK));
      assertThat(response.getContentType().orElseThrow().toString(), startsWith("text/html"));
      assertThat(response.body(), containsString("<mateu-ui baseUrl=\"/yaml-parity\""));
      assertThat(response.body(), containsString("<title>YAML parity</title>"));
    }
  }

  @Test
  void answersNotFoundOutsideTheMountAndForItsApi() {
    assertThat(controller.index(null, "text/html").status(), equalTo(HttpStatus.NOT_FOUND));
    assertThat(controller.index("elsewhere", "text/html").status(), equalTo(HttpStatus.NOT_FOUND));
    assertThat(
        controller.index("yaml-parity/mateu/v3/x", "text/html").status(),
        equalTo(HttpStatus.NOT_FOUND));
    // a data fetch is never answered the index (a REST source whose endpoint does not exist yet)
    assertThat(
        controller.index("yaml-parity/page", "application/json, */*").status(),
        equalTo(HttpStatus.NOT_FOUND));
  }

  @Test
  void servesTheMobileManifestOfTheMount() {
    var response = controller.manifest("yaml-parity/mateu/v3/manifest");
    assertThat(response.status(), equalTo(HttpStatus.OK));
    assertThat(response.getHeaders().get("Cache-Control"), equalTo("public, max-age=300"));
    assertThat(response.getHeaders().get("X-Content-Type-Options"), equalTo("nosniff"));
    assertThat(response.getContentType().orElseThrow().toString(), startsWith("application/json"));
    assertThat(
        response.body(),
        equalTo(
            "{\"name\":\"YAML parity\",\"shortName\":\"YAML parity\",\"wireVersion\":\"3\","
                + "\"minAppVersion\":\"1.0.0\"}"));
    assertThat(
        controller.manifest("elsewhere/mateu/v3/manifest").status(), equalTo(HttpStatus.NOT_FOUND));
  }

  @Test
  void aFreshDeepLinkAnswersTheShellAimedAtTheRouteRelativeToTheMount() throws Throwable {
    var rq = rq("_empty");
    var increment =
        controller
            .sync(
                "yaml-parity/mateu/v3/sync/_no_route",
                rq,
                HttpRequest.POST("/yaml-parity/mateu/v3/sync/_no_route", rq))
            .block();
    var json = WireMapper.shared().writeValueAsString(increment);
    assertThat(json, containsString("\"title\":\"YAML parity\""));
    assertThat(json, containsString("\"homeRoute\":\"/yaml-parity/page\""));
  }

  @Test
  void theContentLoadStreamsThePage() throws Throwable {
    var rq = rq("");
    var increments =
        controller
            .sse(
                "yaml-parity/mateu/v3/sse/_no_route",
                rq,
                HttpRequest.POST("/yaml-parity/mateu/v3/sse/_no_route", rq))
            .collectList()
            .block();
    assertThat(increments, not(empty()));
    assertThat(
        WireMapper.shared().writeValueAsString(increments), containsString("YAML parity page"));
  }

  @Test
  void anApiCallOutsideEveryMountAnswersNothing() throws Throwable {
    var rq = rq("");
    assertThat(
        controller
            .sync("other/mateu/v3/sync/x", rq, HttpRequest.POST("/other/mateu/v3/sync/x", rq))
            .blockOptional()
            .isPresent(),
        is(false));
    assertThat(
        controller
            .sse("other/mateu/v3/sse/x", rq, HttpRequest.POST("/other/mateu/v3/sse/x", rq))
            .collectList()
            .block(),
        empty());
  }

  private static RunActionRqDto rq(String consumedRoute) throws Exception {
    return WireMapper.shared()
        .readValue(
            "{\"route\": \"/page\", \"consumedRoute\": \""
                + consumedRoute
                + "\", \"actionId\": \"\", \"componentState\": {}, \"parameters\": {},"
                + " \"appState\": {}}",
            RunActionRqDto.class);
  }
}
