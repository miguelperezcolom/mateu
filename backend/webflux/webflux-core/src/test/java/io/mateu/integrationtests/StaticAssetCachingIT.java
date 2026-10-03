package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.boot.test.context.SpringBootTest.WebEnvironment.RANDOM_PORT;

import com.example.FakeApplication;
import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

/**
 * Mateu's static assets carry a cache policy instead of none (which Spring Security turns into
 * no-store).
 */
@SpringBootTest(webEnvironment = RANDOM_PORT, classes = FakeApplication.class)
class StaticAssetCachingIT {

  @LocalServerPort private Integer port;

  @BeforeEach
  void setUp() {
    RestAssured.port = port;
  }

  @Test
  void versionedRedwoodAssetsAreImmutable() {
    Response response = given().get("/version_123/bundles/app.js");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.header("Cache-Control")).isEqualTo("max-age=31536000, public, immutable");
  }

  @Test
  void fixedNameAssetsRevalidateAndAnswer304() {
    Response response = given().get("/assets/fixed.js");
    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.header("Cache-Control")).isEqualTo("no-cache");
    String etag = response.header("ETag");
    assertThat(etag).startsWith("W/\"");
    assertThat(response.header("Last-Modified")).isNotBlank();

    Response revalidated = given().header("If-None-Match", etag).get("/assets/fixed.js");
    assertThat(revalidated.statusCode()).isEqualTo(304);
    assertThat(revalidated.body().asByteArray()).isEmpty();
  }

  @Test
  void aMissingVersionedAssetIsNotCached() {
    Response response = given().get("/version_123/bundles/nope.js");
    assertThat(response.statusCode()).isEqualTo(404);
    assertThat(response.header("Cache-Control")).isNull();
  }
}
