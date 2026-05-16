package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;

import io.restassured.http.ContentType;
import java.util.UUID;

public class CreateJourneyITFoundation {

  public void createsJourney() {
    given()
        .contentType(ContentType.JSON)
        .body(
            """
            {
              "route": "/"
            }
            """)
        .when()
        .post("/hello/mateu/v3/journeys/_/" + UUID.randomUUID())
        .then()
        .statusCode(200)
        .body("commands", notNullValue())
        .body("messages", notNullValue())
        .body("fragments", notNullValue());
  }
}
