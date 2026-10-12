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
}
