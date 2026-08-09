package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.http.ContentType;

/**
 * Verifies the runtime static-bundle endpoint {@code GET /mateu/v3/bundle}: it must return the
 * bundle manifest (the same shape the {@code mateu:bundle} Maven goal writes), rendered live from
 * the app's bean graph. Routes are discovered from the live {@code RouteResolver} beans, so a
 * static {@code @UI} route (here {@code /hello}) must come back pre-rendered and {@code ok}. Reused
 * by every server adapter's IT so the endpoint is CI-guarded on each framework.
 */
public class BundleEndpointITFoundation {

  public void servesBundleManifest() {
    given()
        .accept(ContentType.JSON)
        .when()
        .get("/mateu/v3/bundle")
        .then()
        .statusCode(200)
        .body("entries", notNullValue())
        .body("entries.size()", greaterThan(0))
        // the /hello screen is a plain form → it renders and is bundled ok
        .body("entries.find { it.syncPath == 'hello' }", notNullValue())
        .body("entries.find { it.syncPath == 'hello' }.ok", equalTo(true))
        .body("entries.find { it.syncPath == 'hello' }.json", notNullValue());
  }
}
