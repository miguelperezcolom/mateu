package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.micronaut.context.annotation.Property;
import io.micronaut.runtime.server.EmbeddedServer;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * {@link AdapterParityITFoundation#neverServesTheRenderersDeployablePage} with the static mapping
 * the Micronaut starter and e2e app use ({@code static/} at {@code /**}): Micronaut would otherwise
 * answer the renderer's deployable page at {@code /index.html}, and at {@code /}.
 */
@MicronautTest
@Property(name = "micronaut.router.static-resources.assets.mapping", value = "/**")
@Property(name = "micronaut.router.static-resources.assets.paths", value = "classpath:static")
class DeployablePageStaticMappingTest {

  @Inject EmbeddedServer server;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = server.getPort();
  }

  @Test
  void neverServesTheRenderersDeployablePage() throws Exception {
    contract.neverServesTheRenderersDeployablePage();
  }

  @Test
  void stillServesTheRenderersAssets() {
    contract.revalidatesFixedNameAssets("/assets/fixed.js");
  }
}
