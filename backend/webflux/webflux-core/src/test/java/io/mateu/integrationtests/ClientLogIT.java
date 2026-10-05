package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;

/** {@code POST <baseUrl>/mateu/v3/client-log} on WebFlux: one log line per report. */
@ExtendWith(OutputCaptureExtension.class)
@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
class ClientLogIT {

  @LocalServerPort private Integer port;

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }

  @Test
  void logsTheReportAndAnswers204(CapturedOutput output) {
    var response =
        given()
            .contentType("application/json")
            .body("{\"kind\":\"timeout\",\"message\":\"slow\",\"renderer\":\"vaadin\"}")
            .post("/some/base/mateu/v3/client-log");
    assertThat(response.statusCode()).isEqualTo(204);
    assertThat(output.getOut()).contains("client-error {\"level\":\"error\",\"kind\":\"timeout\"");
  }

  @Test
  void refusesAnOversizedBody() {
    var response =
        given()
            .contentType("application/json")
            .body("{\"message\":\"" + "x".repeat(20 * 1024) + "\"}")
            .post("/mateu/v3/client-log");
    assertThat(response.statusCode()).isEqualTo(413);
  }

  @Test
  void answersMalformedWith400() {
    var response =
        given().contentType("application/json").body("{oops").post("/mateu/v3/client-log");
    assertThat(response.statusCode()).isEqualTo(400);
  }
}
