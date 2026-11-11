package io.mateu;

import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.helidon.webserver.WebServer;
import io.helidon.webserver.http.HttpRouting;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.YamlMounts;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.Test;

/**
 * The YAML-mount routes of {@link MateuHelidonRoutes} against the cross-adapter contract ({@link
 * AdapterParityITFoundation#servesAYamlMount()}). The test app also has generated {@code @UI}
 * controllers, so the adapter rightly does not register the mounts on the MP server: they are
 * registered here on a plain Helidon routing, with the app's own beans, and served by a web server
 * of their own.
 */
@HelidonTest
class YamlMountRoutesTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Test
  void servesAYamlMount() {
    // dev mode switches the installable app off, and another test in this JVM may have left it on
    io.mateu.core.infra.dev.DevMode.disable();
    try {
      servesTheMount();
    } finally {
      io.mateu.core.infra.dev.DevMode.reset();
    }
  }

  private void servesTheMount() {
    var cdi = CDI.current();
    var service = cdi.select(MateuService.class).get();
    var routeRegistry = cdi.select(RouteRegistry.class).get();
    var yamlAppLoader = cdi.select(YamlAppLoader.class).get();
    var routing = HttpRouting.builder();
    MateuHelidonRoutes.yamlMountRoutes(
        routing,
        YamlMounts.mounts(routeRegistry, yamlAppLoader),
        () -> service,
        () -> routeRegistry,
        () -> yamlAppLoader);
    WebServer server = WebServer.builder().port(0).routing(routing).build().start();
    int previousPort = RestAssured.port;
    try {
      RestAssured.port = server.port();
      contract.servesAYamlMount();
      contract.servesAYamlMountsInstallableApp();
      contract.offersTheSignInProvidersOnAYamlMount();
    } finally {
      RestAssured.port = previousPort;
      server.stop();
    }
  }

  /**
   * A ROOT YAML mount (the "Code + YAML" / YAML-only app): a deep link to a route its registry
   * authors used to answer Jersey's "Endpoint not found" — only "/" was routed. Paths the registry
   * does not author are left to the app (never shadowed).
   */
  @Test
  void aRootMountAnswersDeepLinksToItsAuthoredRoutesOnly() {
    var cdi = CDI.current();
    var service = cdi.select(MateuService.class).get();
    var routeRegistry = cdi.select(RouteRegistry.class).get();
    var yamlAppLoader = cdi.select(YamlAppLoader.class).get();
    var routing = HttpRouting.builder();
    MateuHelidonRoutes.yamlMountRoutes(
        routing,
        java.util.List.of(new YamlMounts.Mount("", "Root app")),
        () -> service,
        () -> routeRegistry,
        () -> yamlAppLoader);
    WebServer server = WebServer.builder().port(0).routing(routing).build().start();
    try {
      var authored =
          routeRegistry.match("/yaml-parity/page").isPresent() ? "/yaml-parity/page" : "/page";
      RestAssured.given()
          .port(server.port())
          .accept("text/html")
          .get(authored)
          .then()
          .statusCode(200)
          .body(org.hamcrest.Matchers.containsString("<mateu-ui"));
      RestAssured.given()
          .port(server.port())
          .accept("text/html")
          .get("/not-a-route-of-this-mount")
          .then()
          .statusCode(404);
    } finally {
      server.stop();
    }
  }

  /**
   * A refused YAML route answers 403 — the YAML mounts run on Helidon's own routing, which the
   * JAX-RS {@code MateuForbiddenExceptionMapper} does not cover, so a refusal surfaced as a 500.
   */
  @Test
  void aRestrictedYamlRouteIsRefusedWith403() {
    var cdi = CDI.current();
    var service = cdi.select(MateuService.class).get();
    var routeRegistry = cdi.select(RouteRegistry.class).get();
    var yamlAppLoader = cdi.select(YamlAppLoader.class).get();
    var routing = HttpRouting.builder();
    MateuHelidonRoutes.yamlMountRoutes(
        routing,
        YamlMounts.mounts(routeRegistry, yamlAppLoader),
        () -> service,
        () -> routeRegistry,
        () -> yamlAppLoader);
    WebServer server = WebServer.builder().port(0).routing(routing).build().start();
    String rq =
        "{\"route\": \"/restricted\", \"consumedRoute\": \"\", \"actionId\": \"\","
            + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}";
    try {
      for (var api : java.util.List.of("sync", "sse")) {
        RestAssured.given()
            .port(server.port())
            .contentType("application/json")
            .body(rq)
            .post("/yaml-parity/mateu/v3/" + api + "/restricted")
            .then()
            .statusCode(403);
      }
    } finally {
      server.stop();
    }
  }

  /**
   * A mount under a base path answers its deep links with the SPA shell — under the prefix a
   * trusted proxy announces — and leaves its assets, its API paths and non-page requests to the
   * handlers behind it; a call only JAX-RS can authenticate is handed on to Jersey, never run here
   * as nobody.
   */
  @Test
  void aMountUnderABasePathAnswersItsDeepLinksAndHandsJaxRsCallersOn() {
    var cdi = CDI.current();
    var service = cdi.select(MateuService.class).get();
    var routeRegistry = cdi.select(RouteRegistry.class).get();
    var yamlAppLoader = cdi.select(YamlAppLoader.class).get();
    var mount = new YamlMounts.Mount("back-office", "Back office");
    var routing = HttpRouting.builder();
    MateuHelidonRoutes.yamlMountRoutes(
        routing,
        java.util.List.of(mount),
        () -> service,
        () -> routeRegistry,
        () -> yamlAppLoader,
        req -> false,
        req -> req.headers().contains(io.helidon.http.HeaderNames.AUTHORIZATION));
    // what the handlers behind these routes (Jersey, the static content) answer: a marker
    routing.any((req, res) -> res.status(io.helidon.http.Status.I_AM_A_TEAPOT_418).send("behind"));
    WebServer server = WebServer.builder().port(0).routing(routing).build().start();
    String previous = System.getProperty(io.mateu.core.infra.ForwardedPrefix.TRUSTED_PROPERTY);
    System.setProperty(io.mateu.core.infra.ForwardedPrefix.TRUSTED_PROPERTY, "true");
    try {
      RestAssured.given()
          .port(server.port())
          .accept("text/html")
          .header(io.mateu.core.infra.ForwardedPrefix.HEADER, "/tenant-a")
          .get("/back-office/orders/42")
          .then()
          .statusCode(200)
          .body(org.hamcrest.Matchers.containsString("<mateu-ui"))
          .body(org.hamcrest.Matchers.containsString("/tenant-a/"));
      for (var notAPage :
          java.util.List.of("/back-office/assets/app.js", "/back-office/mateu/v3/whatever")) {
        RestAssured.given()
            .port(server.port())
            .accept("text/html")
            .get(notAPage)
            .then()
            .statusCode(418);
      }
      // a data fetch (no text/html) is not answered with the page
      RestAssured.given()
          .port(server.port())
          .accept("application/json")
          .get("/back-office/orders/42")
          .then()
          .statusCode(418);
      // credentials only a JAX-RS filter reads: Jersey answers it (MateuJaxRsEndpoints)
      for (var api : java.util.List.of("sync", "sse")) {
        RestAssured.given()
            .port(server.port())
            .header("Authorization", "Bearer only-jersey-reads-this")
            .contentType("application/json")
            .body("{\"actionId\":\"\",\"route\":\"/\",\"componentState\":{}}")
            .post(mount.apiPrefix() + "/v3/" + api + "/home")
            .then()
            .statusCode(418);
      }
    } finally {
      if (previous == null) {
        System.clearProperty(io.mateu.core.infra.ForwardedPrefix.TRUSTED_PROPERTY);
      } else {
        System.setProperty(io.mateu.core.infra.ForwardedPrefix.TRUSTED_PROPERTY, previous);
      }
      server.stop();
    }
  }

  /** The registry authors a path when it matches it or one of its parents (a crud's /new). */
  @Test
  void aPathIsAuthoredWhenTheRegistryMatchesItOrAParent() {
    var routeRegistry = CDI.current().select(RouteRegistry.class).get();
    var authored =
        routeRegistry.match("/yaml-parity/page").isPresent() ? "/yaml-parity/page" : "/page";
    org.junit.jupiter.api.Assertions.assertTrue(
        MateuHelidonRoutes.authoredHere(routeRegistry, authored));
    org.junit.jupiter.api.Assertions.assertTrue(
        MateuHelidonRoutes.authoredHere(routeRegistry, authored + "/42/edit"));
    org.junit.jupiter.api.Assertions.assertFalse(
        MateuHelidonRoutes.authoredHere(routeRegistry, "/nobody/authors/this"));
    org.junit.jupiter.api.Assertions.assertFalse(
        MateuHelidonRoutes.authoredHere(routeRegistry, "/"));
  }

  /**
   * An app that requires a login (@LoginConfig): the YAML mount's API, served outside Jersey, used
   * to run any action for an anonymous caller. Now it answers 401 when nobody authenticated.
   */
  @Test
  void anAppThatRequiresALoginRefusesAnAnonymousCallToTheMountsApi() {
    var cdi = CDI.current();
    var service = cdi.select(MateuService.class).get();
    var routeRegistry = cdi.select(RouteRegistry.class).get();
    var yamlAppLoader = cdi.select(YamlAppLoader.class).get();
    var mount = new YamlMounts.Mount("locked", "Locked app");
    var routing = HttpRouting.builder();
    MateuHelidonRoutes.yamlMountRoutes(
        routing,
        java.util.List.of(mount),
        () -> service,
        () -> routeRegistry,
        () -> yamlAppLoader,
        req -> HelidonSeIdentity.principalOf(req) == null);
    WebServer server = WebServer.builder().port(0).routing(routing).build().start();
    try {
      RestAssured.given()
          .port(server.port())
          .contentType("application/json")
          .body("{\"actionId\":\"\",\"route\":\"/\",\"componentState\":{}}")
          .post(mount.apiPrefix() + "/v3/sync/home")
          .then()
          .statusCode(401);
      RestAssured.given()
          .port(server.port())
          .contentType("application/json")
          .body("{\"actionId\":\"\",\"route\":\"/\",\"componentState\":{}}")
          .post(mount.apiPrefix() + "/v3/sse/home")
          .then()
          .statusCode(401);
    } finally {
      server.stop();
    }
  }
}
