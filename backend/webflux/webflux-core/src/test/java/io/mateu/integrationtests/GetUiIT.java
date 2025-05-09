package io.mateu.integrationtests;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
public class GetUiIT {

  @LocalServerPort private Integer port;

  @Test
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

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }
}
