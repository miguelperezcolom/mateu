package io.mateu.integrationtests;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
public class CreateJourneyIT {
  @LocalServerPort
  private Integer port;

  @Test
  void createsJourney() {

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

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }

}
