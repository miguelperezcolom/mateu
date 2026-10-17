package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.micronaut.context.annotation.Property;
import io.micronaut.runtime.server.EmbeddedServer;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Micronaut, with client logs and asset caching turned off. */
@MicronautTest
@Property(name = "mateu.client-log.enabled", value = "false")
@Property(name = "mateu.static-assets.caching", value = "false")
// a MateuSettings key, read through Micronaut's Environment (M-S2)
@Property(name = "mateu.mobile.min-app-version", value = "2.5.0")
class AdapterParityDisabledTest {

  @Inject EmbeddedServer server;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = server.getPort();
  }

  @Test
  void refusesClientLogsWhenDisabled() {
    contract.refusesClientLogsWhenDisabled();
  }

  @Test
  void readsMateuSettingsFromTheFrameworkConfiguration() {
    contract.readsMateuSettingsFromTheFrameworkConfiguration();
  }

  @Test
  void setsNoCachePolicyWhenCachingIsOff() {
    contract.setsNoCachePolicyWhenCachingIsOff("/assets/fixed.js");
  }
}
