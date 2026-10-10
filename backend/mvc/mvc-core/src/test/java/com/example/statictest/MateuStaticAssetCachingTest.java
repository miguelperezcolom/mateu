package com.example.statictest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import io.mateu.MateuStaticAssetCaching;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Mateu's assets keep their cache policy with Spring Security on — whose default headers turned
 * them into {@code no-store} before — and revalidate to a 304.
 */
@SpringBootTest(webEnvironment = RANDOM_PORT, classes = MateuStaticAssetCachingTest.App.class)
class MateuStaticAssetCachingTest {

  @SpringBootApplication
  @Import(MateuStaticAssetCaching.class)
  static class App {
    @Bean
    SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
      return http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll()).build();
    }
  }

  @LocalServerPort private int port;

  private final HttpClient client = HttpClient.newHttpClient();

  private HttpResponse<String> get(String path, String... headers) throws Exception {
    var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    for (int i = 0; i < headers.length; i += 2) {
      request.header(headers[i], headers[i + 1]);
    }
    return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
  }

  @Test
  void versionedAssetsAreImmutable() throws Exception {
    var response = get("/version_123/bundles/app.js");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Cache-Control"))
        .hasValue("max-age=31536000, public, immutable");
    assertThat(response.headers().firstValue("Pragma")).isEmpty();
  }

  @Test
  void fixedNameAssetsRevalidateInsteadOfNoStore() throws Exception {
    var response = get("/assets/fixed.js");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Cache-Control")).hasValue("no-cache");
    String etag = response.headers().firstValue("ETag").orElseThrow();
    assertThat(etag).startsWith("W/\"");
    assertThat(response.headers().firstValue("Last-Modified")).isPresent();

    var revalidated = get("/assets/fixed.js", "If-None-Match", etag);
    assertThat(revalidated.statusCode()).isEqualTo(304);
    assertThat(revalidated.body()).isEmpty();
  }

  @Test
  void assetsInsideJarsResolveLikeSpringBootsDefaultHandler() throws Exception {
    var response = get("/assets/from-jar.js");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.headers().firstValue("Cache-Control")).hasValue("no-cache");
  }

  @Test
  void aMissingAssetIsNotMadeCacheable() throws Exception {
    var response = get("/version_123/bundles/nope.js");
    assertThat(response.statusCode()).isEqualTo(404);
    assertThat(response.headers().firstValue("Cache-Control").orElse(""))
        .doesNotContain("immutable");
  }
}
