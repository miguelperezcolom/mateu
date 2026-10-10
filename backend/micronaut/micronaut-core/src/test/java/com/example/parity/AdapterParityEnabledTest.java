package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.micronaut.context.annotation.Property;
import io.micronaut.runtime.server.EmbeddedServer;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Micronaut, with CORS and MCP turned on. */
@MicronautTest
@Property(name = "mateu.cors.allowed-origins", value = AdapterParityITFoundation.ALLOWED_ORIGIN)
@Property(name = "mateu.mcp.enabled", value = "true")
class AdapterParityEnabledTest {

  @Inject EmbeddedServer server;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = server.getPort();
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
