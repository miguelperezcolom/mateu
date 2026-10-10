package io.mateu.clientlogtest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import io.mateu.MateuClientLogFilter;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/** {@code POST <baseUrl>/mateu/v3/client-log}: one log line per report, under any base URL. */
@ExtendWith(OutputCaptureExtension.class)
class MateuClientLogFilterTest {

  @SpringBootApplication
  @Import(MateuClientLogFilter.class)
  static class App {
    @Bean
    SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
      // CSRF stays on, as in a real app; only the reports' path is exempt, the way apps exempt
      // their /mateu/** calls (the browser sends a Bearer token, not a cookie session).
      return http.csrf(
              csrf ->
                  csrf.ignoringRequestMatchers(
                      request -> request.getRequestURI().endsWith("/mateu/v3/client-log")))
          .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
          .build();
    }
  }

  static HttpResponse<String> post(int port, String path, String body) throws Exception {
    var request =
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();
    return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
  }

  @Nested
  @SpringBootTest(webEnvironment = RANDOM_PORT, classes = App.class)
  class Enabled {

    @LocalServerPort int port;

    @Test
    void logsOneLinePerReportAndAnswers204(CapturedOutput output) throws Exception {
      var response =
          post(
              port,
              "/mateu/v3/client-log",
              "{\"level\":\"error\",\"kind\":\"unauthorized\",\"status\":401,"
                  + "\"message\":\"Tu sesión ya no es válida\",\"renderer\":\"redwood\","
                  + "\"url\":\"/mateu/v3/sync/bookings\",\"count\":3,\"evil\":\"dropped\"}");
      assertThat(response.statusCode()).isEqualTo(204);
      assertThat(output.getOut())
          .contains("mateu.client")
          .contains(
              "client-error {\"level\":\"error\",\"kind\":\"unauthorized\",\"renderer\":\"redwood\"")
          .contains("\"status\":401")
          .contains("\"count\":3")
          .doesNotContain("evil");
    }

    @Test
    void answersUnderAnyBaseUrlAndTakesABatch(CapturedOutput output) throws Exception {
      var response =
          post(
              port,
              "/admin/mateu/v3/client-log",
              "[{\"kind\":\"js-error\",\"message\":\"first\"},{\"kind\":\"server\",\"message\":\"second\"}]");
      assertThat(response.statusCode()).isEqualTo(204);
      assertThat(output.getOut())
          .contains("\"message\":\"first\"")
          .contains("\"message\":\"second\"");
    }

    @Test
    void refusesAnOversizedBodyWith413(CapturedOutput output) throws Exception {
      var response =
          post(
              port,
              "/mateu/v3/client-log",
              "{\"kind\":\"big\",\"message\":\"" + "x".repeat(20 * 1024) + "\"}");
      assertThat(response.statusCode()).isEqualTo(413);
      assertThat(output.getOut()).doesNotContain("\"kind\":\"big\"");
    }

    @Test
    void answersAMalformedBodyWith400(CapturedOutput output) throws Exception {
      assertThat(post(port, "/mateu/v3/client-log", "{not json").statusCode()).isEqualTo(400);
      assertThat(post(port, "/mateu/v3/client-log", "42").statusCode()).isEqualTo(400);
    }
  }

  @Nested
  @SpringBootTest(
      webEnvironment = RANDOM_PORT,
      classes = App.class,
      properties = "mateu.client-log.enabled=false")
  class Disabled {

    @LocalServerPort int port;

    @Test
    void answers404AndLogsNothing(CapturedOutput output) throws Exception {
      var response = post(port, "/mateu/v3/client-log", "{\"kind\":\"silenced\"}");
      assertThat(response.statusCode()).isEqualTo(404);
      assertThat(output.getOut()).doesNotContain("silenced");
    }
  }
}
