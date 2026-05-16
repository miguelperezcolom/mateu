package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.http.ContentType;

public class GetUiITFoundation {

  public void getsUi() {
    given()
        .contentType(ContentType.JSON)
        .body(
            """
            {
              "route": "/"
            }
            """)
        .when()
        .post("/travel/mateu/v3/ui")
        .then()
        .statusCode(200)
        .body("commands", notNullValue())
        .body("messages", notNullValue())
        .body("fragments", notNullValue());
  }
}
