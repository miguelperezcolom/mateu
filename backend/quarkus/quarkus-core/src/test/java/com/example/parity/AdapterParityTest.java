package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract ({@link AdapterParityITFoundation}) on Quarkus, defaults. */
@QuarkusTest
class AdapterParityTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Test
  void streamsServerSentEvents() {
    contract.streamsServerSentEvents();
  }

  @Test
  void answersSyncWithJson() {
    contract.answersSyncWithJson();
  }

  @Test
  void resolvesAPlainUiThroughItsGeneratedRouteResolver() {
    contract.resolvesAPlainUiThroughItsGeneratedRouteResolver();
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
  void servesNoDevEndpointsByDefault() {
    contract.servesNoDevEndpointsByDefault();
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
