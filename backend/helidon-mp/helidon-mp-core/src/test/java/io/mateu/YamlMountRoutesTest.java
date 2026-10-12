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
    } finally {
      RestAssured.port = previousPort;
      server.stop();
    }
  }
}
