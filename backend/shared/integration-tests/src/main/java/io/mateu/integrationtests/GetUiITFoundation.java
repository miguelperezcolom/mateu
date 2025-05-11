package io.mateu.integrationtests;

import io.restassured.http.ContentType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

public class GetUiITFoundation {

  void getsUi() {
    given()
        .contentType(ContentType.JSON)
        .body(
            """
          {

          }
          """)
        .log()
        .all()
        .when()
        .post("/travel/mateu/v3/ui")
        .then()
        .log()
        .all()
        .statusCode(200)
        .body("menu", notNullValue())
        .body("title", equalTo("Travel app"));
  }
}
