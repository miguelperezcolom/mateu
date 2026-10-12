package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.YamlMounts;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.RestAssured;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.web.Router;
import jakarta.inject.Inject;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;

/**
 * The YAML-mount routes of {@link MateuQuarkusRoutes} against the cross-adapter contract ({@link
 * AdapterParityITFoundation#servesAYamlMount()}). The test app also has generated {@code @UI}
 * controllers, so the adapter rightly does not register the mounts on its own router: they are
 * registered here on a plain Vert.x router, with the app's own beans, and served on a port of their
 * own.
 */
@QuarkusTest
class YamlMountRoutesTest {

  @Inject Vertx vertx;
  @Inject MateuService service;
  @Inject RouteRegistry routeRegistry;
  @Inject YamlAppLoader yamlAppLoader;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Test
  void servesAYamlMount() throws Exception {
    var mounts = YamlMounts.mounts(routeRegistry, yamlAppLoader);
    var router = Router.router(vertx);
    MateuQuarkusRoutes.yamlMountRoutes(router, mounts, service, routeRegistry, yamlAppLoader);
    HttpServer server =
        vertx
            .createHttpServer()
            .requestHandler(router)
            .listen(0)
            .toCompletionStage()
            .toCompletableFuture()
            .get(20, TimeUnit.SECONDS);
    int previousPort = RestAssured.port;
    try {
      RestAssured.port = server.actualPort();
      contract.servesAYamlMount();
    } finally {
      RestAssured.port = previousPort;
      server.close().toCompletionStage().toCompletableFuture().get(20, TimeUnit.SECONDS);
    }
  }

  /**
   * A YAML app's {@code access:} on Quarkus: the mount routes are Vert.x routes, where the CDI
   * SecurityIdentity lookup finds nothing — the identity rides on the RoutingContext. Without
   * reading it there an admin was refused like anybody else, and the refusal surfaced as a 500.
   */
  @Test
  void aRestrictedYamlRouteIsRefusedWith403AndServedToItsRole() throws Exception {
    var mounts = YamlMounts.mounts(routeRegistry, yamlAppLoader);
    var router = Router.router(vertx);
    // what Quarkus' HTTP security leaves on the context once it authenticated the caller, where
    // Quarkus runs it: its authentication filter (priority 200 → route order -200)
    router
        .route()
        .order(-200)
        .handler(
            rc -> {
              if ("admin".equals(rc.request().getHeader("X-Test-Role"))) {
                rc.setUser(
                    new io.quarkus.vertx.http.runtime.security.QuarkusHttpUser(
                        io.quarkus.security.runtime.QuarkusSecurityIdentity.builder()
                            .setPrincipal(new io.quarkus.security.runtime.QuarkusPrincipal("boss"))
                            .addRole("admin")
                            .build()));
              }
              rc.next();
            });
    MateuQuarkusRoutes.yamlMountRoutes(router, mounts, service, routeRegistry, yamlAppLoader);
    HttpServer server =
        vertx
            .createHttpServer()
            .requestHandler(router)
            .listen(0)
            .toCompletionStage()
            .toCompletableFuture()
            .get(20, TimeUnit.SECONDS);
    int previousPort = RestAssured.port;
    String rq =
        "{\"route\": \"/restricted\", \"consumedRoute\": \"\", \"actionId\": \"\","
            + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}";
    try {
      RestAssured.port = server.actualPort();
      RestAssured.given()
          .contentType("application/json")
          .body(rq)
          .post("/yaml-parity/mateu/v3/sync/restricted")
          .then()
          .statusCode(403);
      RestAssured.given()
          .contentType("application/json")
          .header("X-Test-Role", "admin")
          .body(rq)
          .post("/yaml-parity/mateu/v3/sync/restricted")
          .then()
          .statusCode(200)
          .body(org.hamcrest.Matchers.containsString("YAML parity page"));
    } finally {
      RestAssured.port = previousPort;
      server.close().toCompletionStage().toCompletableFuture().get(20, TimeUnit.SECONDS);
    }
  }
}
