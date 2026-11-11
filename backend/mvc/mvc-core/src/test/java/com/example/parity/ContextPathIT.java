package com.example.parity;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * A Mateu app under a servlet context path ({@code server.servlet.context-path=/ctx}): the page
 * names its assets and API under {@code /ctx}, a deep link still answers the index, and the API and
 * the assets answer there. It used to load {@code /assets/…} from the host root — a blank page.
 */
@SpringBootTest(
    webEnvironment = RANDOM_PORT,
    classes = ParityApp.class,
    properties = "server.servlet.context-path=/ctx")
class ContextPathIT {

  @LocalServerPort Integer port;

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }

  @Test
  void thePageNamesItsAssetsAndApiUnderTheContextPath() {
    for (String path : new String[] {"/ctx/hello", "/ctx/hello/some/deep/link"}) {
      given()
          .accept("text/html")
          .when()
          .get(path)
          .then()
          .statusCode(200)
          .body(containsString("<mateu-ui baseUrl=\"/ctx/hello\" contextPath=\"/ctx\""))
          .body(containsString("\"/ctx/assets/"))
          .body(not(containsString("\"/assets/")));
    }
  }

  @Test
  void theApiAndTheAssetsAnswerUnderTheContextPath() {
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"route\": \"/\", \"actionId\": \"\", \"componentState\": {}, \"parameters\": {},"
                + " \"appState\": {}}")
        .when()
        .post("/ctx/hello/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("application/json"))
        .body(containsString("\"fragments\""));
    given().when().get("/ctx/assets/fixed.js").then().statusCode(200);
  }
}
