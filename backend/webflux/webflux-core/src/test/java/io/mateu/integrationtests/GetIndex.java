package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
public class GetIndex {

  @LocalServerPort private Integer port;

  @Test
  void getsIndex() {
    given()
        .log()
        .all()
        .when()
        .get("/travel")
        .then()
        .log()
        .all()
        .statusCode(200)
        .body("html.head.title", equalTo("Travel app"));
  }

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }
}
