package io.mateu.core.infra.out;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import lombok.extern.slf4j.Slf4j;

@Named
@Slf4j
@Singleton
public class DefaultMateuHttpClient implements MateuHttpClient {

  private final HttpClient httpClient =
      HttpClient.newBuilder()
          .connectTimeout(Duration.ofSeconds(5))
          .version(HttpClient.Version.HTTP_2)
          .build();
  private final ObjectMapper objectMapper;

  public DefaultMateuHttpClient(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto requestDto) {
    try {
      String body = objectMapper.writeValueAsString(requestDto);

      var path = requestDto.route();
      if (path == null || path.isEmpty()) path = "/_no_route";
      if (!path.startsWith("/")) path = "/" + path;

      var uri = baseUrl + "/mateu/v3/sync" + path;

      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(uri))
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(body))
              .build();

      log.info("POST {} {}", uri, body);

      return httpClient
          .sendAsync(request, HttpResponse.BodyHandlers.ofString())
          .thenApply(
              response -> {
                int status = response.statusCode();
                log.info("got {}: {}", status, response.body());
                if (status < 200 || status >= 300) {
                  throw new RuntimeException("HTTP " + status + ": " + response.body());
                }
                try {
                  return objectMapper.readValue(response.body(), UIIncrementDto.class);
                } catch (IOException e) {
                  throw new CompletionException(e);
                }
              });

    } catch (Exception e) {
      return CompletableFuture.failedFuture(e);
    }
  }
}
