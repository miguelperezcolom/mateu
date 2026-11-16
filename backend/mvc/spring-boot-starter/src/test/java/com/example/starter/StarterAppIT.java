package com.example.starter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * The starter's promise, end to end: an application with ONLY {@code mateu-spring-boot-starter} on
 * its classpath and ONLY {@code mateu-annotation-processor-mvc} on its processor path boots, the
 * processor generated the controller of its {@code @UI} class, the action endpoint answers the
 * screen and the page is served with the Vaadin renderer.
 */
@SpringBootTest(webEnvironment = RANDOM_PORT, classes = StarterApp.class)
class StarterAppIT {

  @LocalServerPort int port;

  private final HttpClient http = HttpClient.newHttpClient();

  @Test
  void theProcessorGeneratedTheControllerOfTheUiClass() throws Exception {
    // the annotation processor writes one controller per @UI class into the app's package
    assertThat(Class.forName("com.example.starter.HelloPageController")).isNotNull();
  }

  @Test
  void theSyncEndpointAnswersTheScreen() throws Exception {
    var response =
        http.send(
            HttpRequest.newBuilder(URI.create(base() + "/hello/mateu/v3/sync/_no_route"))
                .header("Content-Type", "application/json")
                .POST(
                    HttpRequest.BodyPublishers.ofString(
                        "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \"\","
                            + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}"))
                .build(),
            HttpResponse.BodyHandlers.ofString());

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("Hello from the starter").contains("\"name\"");
  }

  @Test
  void thePageIsServedWithTheVaadinRenderer() throws Exception {
    var response =
        http.send(
            HttpRequest.newBuilder(URI.create(base() + "/hello"))
                .header("Accept", "text/html")
                .GET()
                .build(),
            HttpResponse.BodyHandlers.ofString());

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("<mateu-ui").contains("/assets/");
  }

  private String base() {
    return "http://localhost:" + port;
  }
}
