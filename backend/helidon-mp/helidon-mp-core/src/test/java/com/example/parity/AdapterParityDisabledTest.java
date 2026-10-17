package com.example.parity;

import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.microprofile.testing.junit5.AddConfig;
import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Helidon MP, with client logs and asset caching turned off. */
@HelidonTest
@AddConfig(key = "mateu.client-log.enabled", value = "false")
@AddConfig(key = "mateu.static-assets.caching", value = "false")
// a MateuSettings key, read through MicroProfile Config (M-S2)
@AddConfig(key = "mateu.mobile.min-app-version", value = "2.5.0")
class AdapterParityDisabledTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = CDI.current().getBeanManager().getExtension(ServerCdiExtension.class).port();
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
