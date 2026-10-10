package com.example.parity;

import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.microprofile.testing.junit5.AddConfig;
import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Helidon MP, with CORS and MCP turned on. */
@HelidonTest
@AddConfig(key = "mateu.cors.allowed-origins", value = AdapterParityITFoundation.ALLOWED_ORIGIN)
@AddConfig(key = "mateu.mcp.enabled", value = "true")
class AdapterParityEnabledTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = CDI.current().getBeanManager().getExtension(ServerCdiExtension.class).port();
  }

  @Test
  void grantsCrossOriginAccessToTheAllowList() {
    contract.grantsCrossOriginAccessToTheAllowList();
  }

  @Test
  void servesMcpWhenEnabled() {
    contract.servesMcpWhenEnabled();
  }
}
