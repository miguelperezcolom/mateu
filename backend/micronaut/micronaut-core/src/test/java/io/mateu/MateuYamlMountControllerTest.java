package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;

import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.micronaut.context.ApplicationContext;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

/**
 * {@link MateuYamlMountController} — the surface of a deployment with no Java {@code @UI} — over
 * the YAML mount fixture ({@code specs/ui/yaml-parity.ui.yaml}: an app shell titled "YAML parity"
 * at {@code /yaml-parity} and a {@code page} route with the text "YAML parity page"). The same
 * expectations as {@code AdapterParityITFoundation.servesAYamlMount} on the other adapters. The
 * test app also has generated {@code @UI} controllers at {@code /hello}, {@code /plain}… and the
 * YAML mounts are served NEXT to them (every adapter, 2026-10-12), so both controllers are beans
 * here: the API ({@link MateuYamlMountController.Present}) and, as there is no ROOT {@code @UI},
 * the shell ({@link MateuYamlMountController.NoRootUi}).
 */
@MicronautTest
class MateuYamlMountControllerTest {

  @Inject ApplicationContext context;
  @Inject MateuYamlMountController controller;
  @Inject MateuYamlMountIndexController indexController;

  @Test
  void isABeanNextToTheAppsGeneratedControllers() {
    assertThat(context.containsBean(MateuYamlMountController.class), is(true));
    assertThat(context.containsBean(MateuYamlMountIndexController.class), is(true));
  }

  @Test
  void deepLinkIndexAnswersTheMountsShellThroughTheBeanProvider() {
    // what a ROOT @UI's generated catch-all index calls for every path (YamlMounts.deepLinkIndex)
    var html = io.mateu.core.infra.YamlMounts.deepLinkIndex("/yaml-parity/page");
    assertThat(html, containsString("<mateu-ui baseUrl=\"/yaml-parity\""));
    assertThat(io.mateu.core.infra.YamlMounts.deepLinkIndex("/elsewhere"), is((String) null));
  }

  @Test
  void servesTheShellOfTheMountAndItsDeepLinks() {
    for (String path : new String[] {"yaml-parity", "yaml-parity/page"}) {
      var response = indexController.index(path, "text/html");
      assertThat(response.status(), equalTo(HttpStatus.OK));
      assertThat(response.getContentType().orElseThrow().toString(), startsWith("text/html"));
      assertThat(response.body(), containsString("<mateu-ui baseUrl=\"/yaml-parity\""));
      assertThat(response.body(), containsString("<title>YAML parity</title>"));
    }
  }

  @Test
  void answersNotFoundOutsideTheMountAndForItsApi() {
    assertThat(indexController.index(null, "text/html").status(), equalTo(HttpStatus.NOT_FOUND));
    assertThat(
        indexController.index("elsewhere", "text/html").status(), equalTo(HttpStatus.NOT_FOUND));
    assertThat(
        indexController.index("yaml-parity/mateu/v3/x", "text/html").status(),
        equalTo(HttpStatus.NOT_FOUND));
    // a data fetch is never answered the index (a REST source whose endpoint does not exist yet)
    assertThat(
        indexController.index("yaml-parity/page", "application/json, */*").status(),
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
            "{\"name\":\"YAML parity\",\"shortName\":\"YAML parity\",\"wireVersion\":\"3.0\","
                + "\"minAppVersion\":\"1.0.0\"}"));
    assertThat(
        controller.manifest("elsewhere/mateu/v3/manifest").status(), equalTo(HttpStatus.NOT_FOUND));
  }

  @Test
  void servesTheInstallableAppOfTheMount() {
    // the shell links it…
    var shell = indexController.index("yaml-parity", "text/html").body();
    assertThat(
        shell,
        containsString(
            "<link rel=\"manifest\" href=\"/yaml-parity/mateu/v3/pwa/manifest.webmanifest\""));
    assertThat(shell, containsString("<script src=\"/yaml-parity/mateu/v3/pwa/register.js\""));

    // …the manifest names the mount's app shell and is scoped to the mount…
    var manifest = controller.pwa("yaml-parity/mateu/v3/pwa/manifest.webmanifest");
    assertThat(manifest.status(), equalTo(HttpStatus.OK));
    assertThat(
        manifest.getContentType().orElseThrow().toString(),
        startsWith("application/manifest+json"));
    assertThat(manifest.getHeaders().get("X-Content-Type-Options"), equalTo("nosniff"));
    assertThat(
        new String(manifest.body(), java.nio.charset.StandardCharsets.UTF_8),
        startsWith(
            "{\"id\":\"/yaml-parity\",\"name\":\"YAML parity\",\"short_name\":\"YAML parity\","
                + "\"start_url\":\"/yaml-parity\",\"scope\":\"/yaml-parity\""));

    // …the worker, served under /mateu/v3/pwa/, is allowed to control the whole mount…
    var worker = controller.pwa("yaml-parity/mateu/v3/pwa/sw.js");
    assertThat(worker.status(), equalTo(HttpStatus.OK));
    assertThat(worker.getContentType().orElseThrow().toString(), startsWith("text/javascript"));
    assertThat(worker.getHeaders().get("Service-Worker-Allowed"), equalTo("/yaml-parity"));
    assertThat(worker.getHeaders().get("Cache-Control"), equalTo("no-cache"));
    assertThat(
        new String(worker.body(), java.nio.charset.StandardCharsets.UTF_8),
        containsString("addEventListener('fetch'"));

    // …and the icons are plain PNGs
    var icon = controller.pwa("yaml-parity/mateu/v3/pwa/icon-192.png");
    assertThat(icon.status(), equalTo(HttpStatus.OK));
    assertThat(icon.getContentType().orElseThrow().toString(), equalTo("image/png"));
    assertThat(icon.body().length > 0, is(true));
  }

  @Test
  void anUnknownInstallableAppFileOrMountIsNotFound() {
    assertThat(
        controller.pwa("yaml-parity/mateu/v3/pwa/nope.js").status(), equalTo(HttpStatus.NOT_FOUND));
    assertThat(
        controller.pwa("elsewhere/mateu/v3/pwa/sw.js").status(), equalTo(HttpStatus.NOT_FOUND));
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
        streamed(
                controller.sse(
                    "yaml-parity/mateu/v3/sse/_no_route",
                    rq,
                    HttpRequest.POST("/yaml-parity/mateu/v3/sse/_no_route", rq)))
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
        streamed(
                controller.sse(
                    "other/mateu/v3/sse/x", rq, HttpRequest.POST("/other/mateu/v3/sse/x", rq)))
            .collectList()
            .block(),
        empty());
  }

  /** The stream an SSE answer carries (a refusal would be a 403 with no stream). */
  @SuppressWarnings("unchecked")
  private static reactor.core.publisher.Flux<io.mateu.dtos.UIIncrementDto> streamed(
      reactor.core.publisher.Mono<io.micronaut.http.HttpResponse<?>> response) {
    return (reactor.core.publisher.Flux<io.mateu.dtos.UIIncrementDto>) response.block().body();
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
