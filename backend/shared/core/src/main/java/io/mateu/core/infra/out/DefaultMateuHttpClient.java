package io.mateu.core.infra.out;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.inject.Inject;
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
  // Mateu's own wire mapper, never the application's ObjectMapper bean: the app owns that one and
  // configures it for its own purposes (and on Boot 4 there may be none on Jackson 2 at all).
  private final ObjectMapper objectMapper;

  @Inject
  public DefaultMateuHttpClient() {
    this(WireMapper.shared());
  }

  public DefaultMateuHttpClient(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public CompletableFuture<UIIncrementDto> send(String baseUrl, RunActionRqDto requestDto) {
    return send(baseUrl, requestDto, null);
  }

  @Override
  public CompletableFuture<UIIncrementDto> send(
      String baseUrl, RunActionRqDto requestDto, String authorizationHeader) {
    try {
      String body = objectMapper.writeValueAsString(requestDto);

      var path = requestDto.route();
      if (path == null || path.isEmpty()) path = "/_no_route";
      if (!path.startsWith("/")) path = "/" + path;

      var target = constrainedTarget(baseUrl, path);

      var requestBuilder =
          HttpRequest.newBuilder()
              .uri(target)
              .timeout(requestTimeout())
              .header("Content-Type", "application/json");
      if (authorizationHeader != null && !authorizationHeader.isBlank()) {
        requestBuilder.header("Authorization", authorizationHeader);
      }
      HttpRequest request = requestBuilder.POST(HttpRequest.BodyPublishers.ofString(body)).build();

      // the body carries the component state (and the Authorization header the caller's token):
      // neither is logged — at DEBUG, only where the call goes.
      log.debug("POST {}", target);

      return httpClient
          .sendAsync(request, HttpResponse.BodyHandlers.ofString())
          .thenApply(
              response -> {
                int status = response.statusCode();
                log.debug("got {} from {}", status, target);
                if (status < 200 || status >= 300) {
                  throw new RuntimeException("HTTP " + status + " from " + target);
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

  /**
   * How long a remote Mateu app has to answer: {@code mateu.remote.timeout-seconds}, default 30.
   */
  static Duration requestTimeout() {
    var configured = io.mateu.core.infra.MateuSettings.get("mateu.remote.timeout-seconds");
    try {
      return Duration.ofSeconds(configured != null ? Long.parseLong(configured) : 30);
    } catch (NumberFormatException e) {
      return Duration.ofSeconds(30);
    }
  }

  /**
   * The url a remote Mateu app is called at, CONSTRAINED so this is not a server-side request
   * forgery: {@code baseUrl} comes from DECLARED configuration (a {@code RemoteMenu}'s baseUrl, a
   * relative one resolved against {@code mateu.self-base-url} or the local socket — never against a
   * request header, see {@code RemoteMenuHandler.absoluteBaseUrl}); it must be plain http(s) with
   * no user info and, when {@code mateu.remote.allowed-hosts} is configured, name an allowed host
   * ({@link RemoteTargets#check}). The route appended to it may not move the call anywhere else:
   * once normalised ({@code ..} resolved) the target must keep the base's scheme, host and port and
   * stay under {@code <base path>/mateu/v3/sync/}.
   */
  static URI constrainedTarget(String baseUrl, String path) {
    var base = URI.create(baseUrl);
    RemoteTargets.check(base);
    var basePath = base.getRawPath() == null ? "" : base.getRawPath();
    if (basePath.endsWith("/")) {
      basePath = basePath.substring(0, basePath.length() - 1);
    }
    var prefix = basePath + "/mateu/v3/sync/";
    var target = URI.create(baseUrl.replaceAll("/+$", "") + "/mateu/v3/sync" + path).normalize();
    if (!base.getScheme().equalsIgnoreCase(target.getScheme())
        || !base.getHost().equalsIgnoreCase(String.valueOf(target.getHost()))
        || base.getPort() != target.getPort()
        || target.getRawUserInfo() != null
        || target.getRawPath() == null
        || !target.getRawPath().startsWith(prefix)) {
      throw new IllegalArgumentException("Route " + path + " leaves the remote app at " + baseUrl);
    }
    return target;
  }
}
