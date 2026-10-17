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
    void refusesARestrictedActionToAnAnonymousCaller() {
      contract.refusesARestrictedActionToAnAnonymousCaller();
    }

    @Test
    void refusesARestrictedStreamedActionToAnAnonymousCaller() {
      contract.refusesARestrictedStreamedActionToAnAnonymousCaller();
    }

    @Test
    void anAuthenticatedPrincipalSeesAndRunsWhatItsRolesAllow() {
      contract.anAuthenticatedPrincipalSeesAndRunsWhatItsRolesAllow(
          java.util.Map.of(AdapterParityITFoundation.PARITY_ROLES_HEADER, "admin"));
    }

    @Test
    void answersAnUnexpectedErrorWithAReferenceNeverItsMessage() {
      contract.answersAnUnexpectedErrorWithAReferenceNeverItsMessage();
    }

    @Test
    void aForgedBearerTokenRevealsNothing() {
      contract.aForgedBearerTokenRevealsNothing();
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
    void answersDeepLinksWithEncodedSegments() {
      contract.answersDeepLinksWithEncodedSegments();
    }

    @Test
    void doesNotAnswerADataFetchWithTheIndex() {
      contract.doesNotAnswerADataFetchWithTheIndex();
    }

    @Test
    void servesTheMobileManifest() {
      contract.servesTheMobileManifest();
    }

    @Test
    void servesTheRuntimeBundle() {
      contract.servesTheRuntimeBundle();
    }

    @Test
    void servesAYamlMount() {
      contract.servesAYamlMount();
    }

    @Test
    void passesTheHttpRequestToTheUi() {
      contract.passesTheHttpRequestToTheUi();
    }

    @Test
    void neverCachesAMissingVersionedAsset() {
      contract.neverCachesAMissingVersionedAsset();
    }

    @Test
    void answersARevalidationOfAnUnchangedAssetWith304() {
      contract.answersARevalidationOfAnUnchangedAssetWith304("/assets/fixed.js");
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
    void mcpToolCallsApplyTheSameRbacAndErrorBoundary() {
      contract.mcpToolCallsApplyTheSameRbacAndErrorBoundary();
    }

    @Test
    void grantsNoCrossOriginAccessOutsideTheMateuApi() {
      contract.grantsNoCrossOriginAccessOutsideTheMateuApi("/assets/fixed.js");
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

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = FakeApplication.class,
      properties = {"mateu.client-log.enabled=false", "mateu.static-assets.caching=false"})
  class Disabled {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void refusesClientLogsWhenDisabled() {
      contract.refusesClientLogsWhenDisabled();
    }

    @Test
    void setsNoCachePolicyWhenCachingIsOff() {
      contract.setsNoCachePolicyWhenCachingIsOff("/assets/fixed.js");
    }
  }
}
