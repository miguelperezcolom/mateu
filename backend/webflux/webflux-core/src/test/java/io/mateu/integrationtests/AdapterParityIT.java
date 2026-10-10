package io.mateu.integrationtests;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/** The cross-adapter HTTP contract ({@link AdapterParityITFoundation}) on WebFlux. */
class AdapterParityIT {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Nested
  @SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
  class Defaults {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
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
  }

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = FakeApplication.class,
      properties = {
        "mateu.cors.allowed-origins=" + AdapterParityITFoundation.ALLOWED_ORIGIN,
        "mateu.mcp.enabled=true",
        "mateu.dev=true"
      })
  class Enabled {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

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
}
