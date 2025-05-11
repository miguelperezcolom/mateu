package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

public class GetIndexITFoundation {

  void getsIndex() {
    RestAssured.given()
        .log()
        .all()
        .when()
        .get("/travel")
        .then()
        .log()
        .all()
        .statusCode(200)
        .body("html.head.title", Matchers.equalTo("Travel app"));
  }

}
