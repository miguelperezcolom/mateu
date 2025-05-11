package io.mateu.integrationtests;

import io.restassured.http.ContentType;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

public class RunActionITFoundation {

  public void runsAction() {

    var componentId = "_";
    var actionId = "action";

    RestAssured.given()
        .contentType(ContentType.JSON)
        .body(
            """
                  {
                  "componentType": "com.example.uis.basic.HelloWorld"
                  }
                  """)
        .log()
        .all()
        .when()
        .post("/hello/mateu/v3/components/" + componentId + "/" + actionId)
        .then()
        .log()
        .all()
        .statusCode(200)
        .body("commands", Matchers.notNullValue())
        .body("messages", Matchers.notNullValue())
        .body("uiFragments", Matchers.notNullValue())
        .body("appData", Matchers.nullValue());
  }
}
