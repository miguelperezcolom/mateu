package com.example.parity;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.not;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

/** The Quarkus renderer-asset route's own branches, beyond the shared parity contract. */
@QuarkusTest
class RendererAssetsTest {

  @Test
  void aHeadRequestAnswersTheLengthWithNoBody() {
    given()
        .when()
        .head("/assets/fixed.js")
        .then()
        .statusCode(200)
        .header("Content-Length", not(emptyString()))
        .header("Content-Type", containsString("javascript"));
  }

  @Test
  void anUnchangedAssetRevalidatedByDateAnswers304() {
    var lastModified = given().when().get("/assets/fixed.js").getHeader("Last-Modified");
    given()
        .header("If-Modified-Since", lastModified)
        .when()
        .get("/assets/fixed.js")
        .then()
        .statusCode(304);
  }

  @Test
  void aChangedEtagGetsTheAssetAgain() {
    given()
        .header("If-None-Match", "W/\"not-this-one\"")
        .when()
        .get("/assets/fixed.js")
        .then()
        .statusCode(200);
  }

  @Test
  void aMissingAssetPassesOnAndIsNotFound() {
    given().when().get("/assets/no-such-file.js").then().statusCode(404);
    given().when().head("/_redwood/no-such-file.js").then().statusCode(404);
  }

  @Test
  void aPathEscapingTheFolderIsNotServed() {
    given()
        .urlEncodingEnabled(false)
        .when()
        .get("/assets/%2e%2e/_index.html")
        .then()
        .statusCode(404);
  }
}
