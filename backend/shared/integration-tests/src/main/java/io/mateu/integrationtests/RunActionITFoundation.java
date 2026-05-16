package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.http.ContentType;

public class RunActionITFoundation {

  public void runsAction() {
    given()
        .contentType(ContentType.JSON)
        .body(
            """
            {
              "route": "/"
            }
            """)
        .when()
        .post("/hello/mateu/v3/components/_/action")
        .then()
        .statusCode(200)
        .body("commands", notNullValue())
        .body("messages", notNullValue())
        .body("fragments", notNullValue());
  }
}
