package io.mateu.integrationtests;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

public class CreateJourneyIT {

  public void createsJourney() {

    var journeyTypeId = "_";
    var journeyId = UUID.randomUUID().toString();

    given()
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
        .body("commands", notNullValue())
        .body("messages", notNullValue())
        .body("uiFragments", notNullValue())
        .body("appData", nullValue());
  }

}
