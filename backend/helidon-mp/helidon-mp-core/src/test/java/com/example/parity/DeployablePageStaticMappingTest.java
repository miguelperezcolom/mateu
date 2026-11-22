package com.example.parity;

import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.microprofile.testing.junit5.AddConfig;
import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link AdapterParityITFoundation#neverServesTheRenderersDeployablePage} with the whole {@code
 * static/} folder served at {@code /} (demo-vaadin-helidon-mp's configuration): Helidon's static
 * content would otherwise answer the renderer's deployable page at {@code /index.html} and {@code
 * /}.
 */
@HelidonTest
@AddConfig(key = "server.static.classpath.context", value = "/")
@AddConfig(key = "server.static.classpath.location", value = "/static")
class DeployablePageStaticMappingTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = CDI.current().getBeanManager().getExtension(ServerCdiExtension.class).port();
  }

  @Test
  void neverServesTheRenderersDeployablePage() throws Exception {
    contract.neverServesTheRenderersDeployablePage();
  }
}
