package com.example.parity;

import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.microprofile.testing.junit5.HelidonTest;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import jakarta.enterprise.inject.spi.CDI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The cross-adapter HTTP contract ({@link AdapterParityITFoundation}) on Helidon MP, defaults. */
@HelidonTest
class AdapterParityTest {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @BeforeEach
  void setUp() {
    RestAssured.port = CDI.current().getBeanManager().getExtension(ServerCdiExtension.class).port();
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
  void servesAParkedDocumentOnce() {

    contract.servesAParkedDocumentOnce(
        io.mateu.core.infra.documents.DocumentStore.shared()
            .park(
                io.mateu.uidl.data.Document.attachment(
                    "Factura ñ.pdf",
                    "application/pdf",
                    "%PDF-1.4 parity".getBytes(java.nio.charset.StandardCharsets.US_ASCII))));
  }

  @Test
  void revalidatesFixedNameAssets() {
    contract.revalidatesFixedNameAssets("/assets/fixed.js");
  }
}
