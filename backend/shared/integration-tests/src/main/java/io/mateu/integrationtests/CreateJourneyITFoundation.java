package io.mateu.integrationtests;

import io.restassured.http.ContentType;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

public class CreateJourneyITFoundation {

  public void createsJourney() {

    var journeyTypeId = "_";
    var journeyId = UUID.randomUUID().toString();

    RestAssured.given()
        .contentType(ContentType.JSON)
        .body(
            """
                  {
                    "context-data": {},
                    "hash": "_hash"
                  }
                  """)
        .log()
        .all()
        .when()
        .post("/hello/mateu/v3/journeys/" + journeyTypeId + "/" + journeyId)
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
