package com.example.parity;

import io.mateu.core.infra.dev.DevMode;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.micronaut.context.annotation.Property;
import io.micronaut.runtime.server.EmbeddedServer;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Micronaut, with CORS and MCP turned on. */
@MicronautTest
@Property(name = "mateu.cors.allowed-origins", value = AdapterParityITFoundation.ALLOWED_ORIGIN)
@Property(name = "mateu.mcp.enabled", value = "true")
@Property(name = "mateu.mcp.push.enabled", value = "true")
@Property(name = "mateu.dev", value = "true")
class AdapterParityEnabledTest {

  @Inject EmbeddedServer server;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  // `mateu.dev=true` turns dev mode on JVM-wide (DevMode.enable): leave it as found for the
  // tests that run after this one in the same fork (dev mode switches the installable app off)
  @AfterAll
  static void leaveDevModeAsFound() {
    DevMode.reset();
  }

  @BeforeEach
  void setUp() {
    RestAssured.port = server.getPort();
  }

  @Test
  void grantsCrossOriginAccessToTheAllowList() {
    contract.grantsCrossOriginAccessToTheAllowList();
  }

  @Test
  void mcpToolCallsApplyTheSameRbacAndErrorBoundary() {
    contract.mcpToolCallsApplyTheSameRbacAndErrorBoundary();
  }

  @Test
  void grantsNoCrossOriginAccessOutsideTheMateuApi() {
    contract.grantsNoCrossOriginAccessOutsideTheMateuApi("/assets/fixed.js");
  }

  @Test
  void servesMcpWhenEnabled() {
    contract.servesMcpWhenEnabled();
  }

  @Test
  void refusesANonJsonBodyOnTheMcpEndpoint() throws Exception {
    contract.refusesANonJsonBodyOnTheMcpEndpoint();
  }

  @Test
  void servesDevEndpointsWhenEnabled() throws Exception {
    contract.servesDevEndpointsWhenEnabled();
  }

  @Test
  void pushesUiToALiveSessionOverTheSseStream() throws Exception {
    contract.pushesUiToALiveSessionOverTheSseStream();
  }
}
