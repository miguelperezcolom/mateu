package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Quarkus, with CORS and MCP turned on. */
@QuarkusTest
@TestProfile(AdapterParityEnabledTest.Enabled.class)
class AdapterParityEnabledTest {

  public static class Enabled implements QuarkusTestProfile {
    @Override
    public Map<String, String> getConfigOverrides() {
      return Map.of(
          "mateu.cors.allowed-origins",
          AdapterParityITFoundation.ALLOWED_ORIGIN,
          "mateu.mcp.enabled",
          "true",
          "mateu.dev",
          "true");
    }
  }

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Test
  void grantsCrossOriginAccessToTheAllowList() {
    contract.grantsCrossOriginAccessToTheAllowList();
  }

  @Test
  void servesMcpWhenEnabled() {
    contract.servesMcpWhenEnabled();
  }

  @Test
  void servesDevEndpointsWhenEnabled() throws Exception {
    contract.servesDevEndpointsWhenEnabled();
  }
}
