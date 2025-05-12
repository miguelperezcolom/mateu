package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

import io.restassured.http.ContentType;

public class RunActionITFoundation {

  public void runsAction() {

    var componentId = "_";
    var actionId = "action";

    given()
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
        .body("commands", notNullValue())
        .body("messages", notNullValue())
        .body("uiFragments", notNullValue())
        .body("appData", nullValue());
  }
}
