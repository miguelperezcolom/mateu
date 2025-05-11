package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
public class RunActionIT {

  @LocalServerPort private Integer port;

  @Test
  void runsAction() {
    new RunActionITFoundation().runsAction();
  }

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }
}
