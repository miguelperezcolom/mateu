package com.example.security;

import static io.restassured.RestAssured.given;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.parity.ParityApp;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * B2: an app that adds Spring Security, as the security guide says, keeps working — Mateu's JSON
 * calls are exempt from CSRF — while everything a cross-site form could send still needs the token.
 * {@link ParityApp}'s chain leaves CSRF at Spring Security's default.
 */
class MateuCsrfIT {

  static final String RQ =
      """
      {"route": "/", "actionId": "", "componentState": {}, "parameters": {}, "appState": {}}
      """;

  @Nested
  // a context of its own: sharing the AdapterParityIT one would leave that cached context behind
  // the newer ones (Mateu's static bean provider follows the last started context)
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = ParityApp.class,
      properties = "mateu.security.csrf-exemption.enabled=true")
  class Exempt {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void aJsonActionPassesCsrf() {
      given()
          .contentType(ContentType.JSON)
          .body(RQ)
          .when()
          .post("/hello/mateu/v3/sync/_no_route")
          .then()
          .statusCode(200);
    }

    @Test
    void aCrossSiteFormShapedPostStillNeedsTheToken() {
      // refused either way: the JSON-only guard (415, JsonBodyGuard) runs ahead of Spring
      // Security's CSRF check (403); neither lets the forged request reach an action
      given()
          .contentType("text/plain")
          .body(RQ)
          .when()
          .post("/hello/mateu/v3/sync/_no_route")
          .then()
          .statusCode(
              org.hamcrest.Matchers.anyOf(
                  org.hamcrest.Matchers.is(403), org.hamcrest.Matchers.is(415)));
      given()
          .contentType(ContentType.URLENC)
          .formParam("x", "1")
          .when()
          .post("/hello/mateu/v3/sync/_no_route")
          .then()
          .statusCode(
              org.hamcrest.Matchers.anyOf(
                  org.hamcrest.Matchers.is(403), org.hamcrest.Matchers.is(415)));
    }
  }

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = ParityApp.class,
      properties = "mateu.security.csrf-exemption.enabled=false")
  class TurnedOff {

    @LocalServerPort Integer port;

    @BeforeEach
    void setUp() {
      RestAssured.port = port;
    }

    @Test
    void theApplicationsCsrfAppliesToMateuToo() {
      given()
          .contentType(ContentType.JSON)
          .body(RQ)
          .when()
          .post("/hello/mateu/v3/sync/_no_route")
          .then()
          .statusCode(403);
    }
  }
}
