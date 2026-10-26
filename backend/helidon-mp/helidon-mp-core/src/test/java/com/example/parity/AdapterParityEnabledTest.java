package com.example.parity;

import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.microprofile.testing.junit5.AddConfig;
import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.mateu.core.infra.dev.DevMode;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Helidon MP, with CORS and MCP turned on. */
@HelidonTest
@AddConfig(key = "mateu.cors.allowed-origins", value = AdapterParityITFoundation.ALLOWED_ORIGIN)
@AddConfig(key = "mateu.mcp.enabled", value = "true")
@AddConfig(key = "mateu.mcp.push.enabled", value = "true")
@AddConfig(key = "mateu.dev", value = "true")
class AdapterParityEnabledTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  // `mateu.dev=true` turns dev mode on JVM-wide (DevMode.enable): leave it as found for the
  // tests that run after this one in the same fork (dev mode switches the installable app off)
  @AfterAll
  static void leaveDevModeAsFound() {
    DevMode.reset();
  }

  @BeforeEach
  void setUp() {
    RestAssured.port = CDI.current().getBeanManager().getExtension(ServerCdiExtension.class).port();
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
