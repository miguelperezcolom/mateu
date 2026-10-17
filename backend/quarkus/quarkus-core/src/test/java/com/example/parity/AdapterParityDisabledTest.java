package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.QuarkusTestProfile;
import io.quarkus.test.junit.TestProfile;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract on Quarkus, with client logs and asset caching turned off. */
@QuarkusTest
@TestProfile(AdapterParityDisabledTest.Disabled.class)
class AdapterParityDisabledTest {

  public static class Disabled implements QuarkusTestProfile {
    @Override
    public Map<String, String> getConfigOverrides() {
      return Map.of("mateu.client-log.enabled", "false", "mateu.static-assets.caching", "false");
    }
  }

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Test
  void refusesClientLogsWhenDisabled() {
    contract.refusesClientLogsWhenDisabled();
  }

  @Test
  void setsNoCachePolicyWhenCachingIsOff() {
    contract.setsNoCachePolicyWhenCachingIsOff("/assets/fixed.js");
  }
}
