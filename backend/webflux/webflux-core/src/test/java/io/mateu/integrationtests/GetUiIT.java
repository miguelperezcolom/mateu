package io.mateu.integrationtests;

import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
public class GetUiIT {

  @LocalServerPort private Integer port;

  @Test
  void getsUi() {
    new GetUiITFoundation().getsUi();
  }

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }
}
