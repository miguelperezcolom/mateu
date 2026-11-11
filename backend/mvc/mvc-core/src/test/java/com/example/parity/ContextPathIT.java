package com.example.parity;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * A Spring MVC app under {@code server.servlet.context-path=/crm}: the page is written for the
 * public path (its assets, the root's {@code baseUrl}, the installable-app links), a deep link is
 * still answered the index (SpaRedirectFilter compared the WHOLE request URI with the
 * context-relative base URLs and forwarded nowhere), and the API answers under the context path.
 */
@SpringBootTest(
    webEnvironment = RANDOM_PORT,
    classes = ParityApp.class,
    properties = "server.servlet.context-path=/crm")
class ContextPathIT {

  @LocalServerPort Integer port;

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
    // another suite of this JVM may have forced development mode on (no installable app then)
    io.mateu.core.infra.dev.DevMode.reset();
  }

  @AfterEach
  void tearDown() {
    RestAssured.reset();
  }

  @Test
  void thePageIsWrittenForTheContextPath() {
    given()
        .accept("text/html")
        .when()
        .get("/crm/plain")
        .then()
        .statusCode(200)
        .body(containsString("<mateu-ui baseUrl=\"/crm/plain\" pathPrefix=\"/crm/plain\""))
        .body(containsString("publicBase=\"/crm\""))
        .body(containsString("href=\"/crm/assets/mateu-icon.svg\""))
        .body(not(containsString("=\"/assets/")))
        .body(containsString("href=\"/crm/plain/mateu/v3/pwa/manifest.webmanifest\""));
  }

  @Test
  void aDeepLinkIsAnsweredTheIndex() {
    given()
        .accept("text/html")
        .when()
        .get("/crm/hello/some/deep/link")
        .then()
        .statusCode(200)
        .body(containsString("<mateu-ui baseUrl=\"/crm/hello\""));
  }

  @Test
  void theApiAndTheAssetsAnswerUnderTheContextPath() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"route\":\"\",\"actionId\":\"\",\"componentState\":{}}")
        .when()
        .post("/crm/plain/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200);
    given().when().get("/crm/assets/fixed.js").then().statusCode(200);
    given()
        .when()
        .get("/crm/plain/mateu/v3/pwa/sw.js")
        .then()
        .statusCode(200)
        .header("Service-Worker-Allowed", equalTo("/crm/plain"));
  }
}
