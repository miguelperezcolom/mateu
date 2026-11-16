package com.example.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/** The app boots, serves its page and answers Mateu's action endpoint for the @UI class. */
@SpringBootTest(webEnvironment = RANDOM_PORT)
class DemoApplicationTests {

  @LocalServerPort int port;

  private final HttpClient http = HttpClient.newHttpClient();

  @Test
  void loadsTheHomeScreen() throws Exception {
    var answer = sync("");
    assertThat(answer.statusCode()).isEqualTo(200);
    assertThat(answer.body()).contains("Hello, Mateu").contains("\"name\"");
  }

  @Test
  void runsTheButtonAction() throws Exception {
    var answer = sync("greet");
    assertThat(answer.statusCode()).isEqualTo(200);
    assertThat(answer.body()).contains("Hello, world!");
  }

  @Test
  void servesThePageWithTheRenderer() throws Exception {
    var page =
        http.send(
            HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/"))
                .header("Accept", "text/html")
                .build(),
            HttpResponse.BodyHandlers.ofString());
    assertThat(page.statusCode()).isEqualTo(200);
    assertThat(page.body()).contains("<mateu-ui");
  }

  private HttpResponse<String> sync(String actionId) throws Exception {
    var body =
        "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \""
            + actionId
            + "\", \"serverSideType\": \"com.example.demo.Home\","
            + " \"componentState\": {\"name\": \"world\"}, \"parameters\": {}, \"appState\": {}}";
    return http.send(
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/mateu/v3/sync/_no_route"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build(),
        HttpResponse.BodyHandlers.ofString());
  }
}
