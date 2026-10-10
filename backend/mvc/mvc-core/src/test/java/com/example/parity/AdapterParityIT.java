package com.example.parity;

import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/** The cross-adapter HTTP contract ({@link AdapterParityITFoundation}) on Spring MVC. */
class AdapterParityIT {

  final AdapterParityITFoundation contract = new AdapterParityITFoundation();

  @Nested
  @SpringBootTest(webEnvironment = RANDOM_PORT, classes = ParityApp.class)
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

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = ParityApp.class,
      properties = {
        "mateu.cors.allowed-origins=" + AdapterParityITFoundation.ALLOWED_ORIGIN,
        "mateu.mcp.enabled=true"
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
  }
}
