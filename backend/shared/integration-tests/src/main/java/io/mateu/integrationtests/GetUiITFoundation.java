package io.mateu.integrationtests;

import io.restassured.http.ContentType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

public class GetUiITFoundation {

  void getsUi() {
    RestAssured.given()
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
        .body("menu", Matchers.notNullValue())
        .body("title", Matchers.equalTo("Travel app"));
  }
}
