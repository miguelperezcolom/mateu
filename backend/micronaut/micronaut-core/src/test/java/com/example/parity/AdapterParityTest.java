package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.micronaut.runtime.server.EmbeddedServer;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import io.restassured.RestAssured;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract ({@link AdapterParityITFoundation}) on Micronaut, defaults. */
@MicronautTest
class AdapterParityTest {

  @Inject EmbeddedServer server;

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = server.getPort();
  }

  @Test
  void streamsServerSentEvents() {
    contract.streamsServerSentEvents();
  }

  @Test
  void answersSyncWithJson() {
    contract.answersSyncWithJson();
  }

  @Test
  void grantsNoCrossOriginAccessByDefault() {
    contract.grantsNoCrossOriginAccessByDefault();
  }

  @Test
  void servesNoMcpByDefault() {
    contract.servesNoMcpByDefault();
  }

  @Test
  void answersDeepLinksWithTheIndex() {
    contract.answersDeepLinksWithTheIndex();
  }

  @Test
  void acceptsClientLogs() {
    contract.acceptsClientLogs();
  }

  @Test
  void revalidatesFixedNameAssets() {
    contract.revalidatesFixedNameAssets("/assets/fixed.js");
  }
}
