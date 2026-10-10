package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.Iterator;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * The HTTP contract every adapter (MVC, WebFlux, Micronaut, Quarkus, Helidon MP) must honour,
 * written once and run by each adapter's own test suite against its own embedded server. The
 * fixture is a {@code @UI("/hello")} whose every action answers itself.
 */
public class AdapterParityITFoundation {

  // A localhost origin (the VB dev server's): the tests run against a server on localhost, and
  // Micronaut refuses any request from a NON-localhost origin to a localhost server (its
  // drive-by-localhost protection) before the application's filters can allow it.
  public static final String ALLOWED_ORIGIN = "http://localhost:9006";
  public static final String OTHER_ORIGIN = "http://other.example";

  private static final String RQ =
      """
      {
        "route": "/",
        "actionId": "",
        "componentState": {},
        "parameters": {},
        "appState": {}
      }
      """;

  /**
   * {@code v3/sse/**} streams {@code text/event-stream} with one {@code data:} event per increment.
   */
  public void streamsServerSentEvents() {
    given()
        .contentType(ContentType.JSON)
        .accept("text/event-stream")
        .body(RQ)
        .when()
        .post("/hello/mateu/v3/sse/_no_route")
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("text/event-stream"))
        .body(startsWith("data:"))
        .body(containsString("\"fragments\""));
  }

  /**
   * A plain {@code @UI("/plain") @Title("Plain form")} class (no handler interfaces) is found
   * through the generated route resolver — a bean the adapter's container must actually register.
   */
  public void resolvesAPlainUiThroughItsGeneratedRouteResolver() {
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \"\","
                + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}")
        .when()
        .post("/plain/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("Plain form"));
  }

  /** The plain sync endpoint keeps answering one JSON body. */
  public void answersSyncWithJson() {
    given()
        .contentType(ContentType.JSON)
        .body(RQ)
        .when()
        .post("/hello/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("application/json"))
        .body(containsString("\"fragments\""));
  }

  /** Without {@code mateu.cors.allowed-origins}, no origin is ever granted access. */
  public void grantsNoCrossOriginAccessByDefault() {
    for (String path : new String[] {"/hello/mateu/v3/sync/x", "/hello/mateu/v3/sse/x"}) {
      given()
          .header("Origin", OTHER_ORIGIN)
          .header("Access-Control-Request-Method", "POST")
          .header("Access-Control-Request-Headers", "content-type")
          .when()
          .options(path)
          .then()
          .header("Access-Control-Allow-Origin", nullValue())
          .header("Access-Control-Allow-Credentials", nullValue());
    }
    given()
        .header("Origin", OTHER_ORIGIN)
        .contentType(ContentType.JSON)
        .body(RQ)
        .when()
        .post("/hello/mateu/v3/sync/_no_route")
        .then()
        .header("Access-Control-Allow-Origin", nullValue());
  }

  /**
   * With {@code mateu.cors.allowed-origins=}{@value #ALLOWED_ORIGIN}: a preflight from it is
   * answered (sync AND sse paths), one from any other origin is not, and the actual response
   * carries the header.
   */
  public void grantsCrossOriginAccessToTheAllowList() {
    for (String path : new String[] {"/hello/mateu/v3/sync/x", "/hello/mateu/v3/sse/x"}) {
      given()
          .header("Origin", ALLOWED_ORIGIN)
          .header("Access-Control-Request-Method", "POST")
          .header("Access-Control-Request-Headers", "content-type")
          .when()
          .options(path)
          .then()
          .statusCode(200)
          .header("Access-Control-Allow-Origin", equalTo(ALLOWED_ORIGIN))
          .header("Access-Control-Allow-Methods", containsString("POST"))
          .header("Access-Control-Allow-Credentials", nullValue());
      given()
          .header("Origin", OTHER_ORIGIN)
          .header("Access-Control-Request-Method", "POST")
          .when()
          .options(path)
          .then()
          .header("Access-Control-Allow-Origin", nullValue());
    }
    given()
        .header("Origin", ALLOWED_ORIGIN)
        .contentType(ContentType.JSON)
        .body(RQ)
        .when()
        .post("/hello/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .header("Access-Control-Allow-Origin", equalTo(ALLOWED_ORIGIN));
  }

  /** {@code POST /mateu/mcp} does not exist unless {@code mateu.mcp.enabled=true}. */
  public void servesNoMcpByDefault() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(not(equalTo(200)));
  }

  /** With {@code mateu.mcp.enabled=true} the MCP endpoint answers JSON-RPC. */
  public void servesMcpWhenEnabled() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(200)
        .body(containsString("protocolVersion"));
    given()
        .contentType(ContentType.JSON)
        .body("{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(202);
  }

  /**
   * The live-reload endpoints ({@code GET /mateu/dev/events}, {@code POST /mateu/dev/reload}) do
   * not exist unless {@code mateu.dev=true}.
   */
  public void servesNoDevEndpointsByDefault() {
    given()
        .accept("text/event-stream")
        .when()
        .get("/mateu/dev/events")
        .then()
        .statusCode(not(equalTo(200)));
    given().when().post("/mateu/dev/reload").then().statusCode(not(equalTo(204)));
  }

  /**
   * With {@code mateu.dev=true}: the index announces the event stream ({@code <meta
   * name="mateu-dev">}), the stream opens with a {@code hello} carrying the boot id, and {@code
   * POST /mateu/dev/reload} answers 204 and is pushed to the open stream as a {@code reload} event.
   */
  public void servesDevEndpointsWhenEnabled() throws Exception {
    given()
        .accept("text/html")
        .when()
        .get("/hello")
        .then()
        .statusCode(200)
        .body(containsString("name=\"mateu-dev\""));
    var client = HttpClient.newHttpClient();
    var request =
        java.net.http.HttpRequest.newBuilder(
                URI.create("http://localhost:" + RestAssured.port + "/mateu/dev/events"))
            .header("Accept", "text/event-stream")
            .GET()
            .build();
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      var response =
          executor
              .submit(() -> client.send(request, HttpResponse.BodyHandlers.ofLines()))
              .get(20, TimeUnit.SECONDS);
      if (response.statusCode() != 200) {
        throw new AssertionError("dev events answered " + response.statusCode());
      }
      var contentType = response.headers().firstValue("Content-Type").orElse("");
      if (!contentType.startsWith("text/event-stream")) {
        throw new AssertionError("dev events content type: " + contentType);
      }
      try (var lines = response.body()) {
        var it = lines.iterator();
        var hello = nextData(executor, it);
        if (!hello.contains("\"hello\"") || !hello.contains("bootId")) {
          throw new AssertionError("first dev event was not a hello: " + hello);
        }
        given().when().post("/mateu/dev/reload").then().statusCode(204);
        String event;
        do {
          event = nextData(executor, it);
        } while (event.contains("\"ping\""));
        if (!event.contains("\"reload\"")) {
          throw new AssertionError("reload was not pushed to the stream: " + event);
        }
      }
    } finally {
      executor.shutdownNow();
    }
  }

  private static String nextData(ExecutorService executor, Iterator<String> lines)
      throws Exception {
    return executor
        .submit(
            () -> {
              while (lines.hasNext()) {
                var line = lines.next();
                if (line.startsWith("data:")) {
                  return line.substring(5).trim();
                }
              }
              throw new AssertionError("dev event stream ended");
            })
        .get(20, TimeUnit.SECONDS);
  }

  /** A deep link under a UI answers that UI's index page. */
  public void answersDeepLinksWithTheIndex() {
    given()
        .accept("text/html")
        .when()
        .get("/hello/some/deep/link")
        .then()
        .statusCode(200)
        .body(containsString("<mateu-ui baseUrl=\"/hello\""));
  }

  /** The renderer's error reports are accepted under any UI's base URL. */
  public void acceptsClientLogs() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"kind\":\"timeout\",\"message\":\"slow\"}")
        .when()
        .post("/hello/mateu/v3/client-log")
        .then()
        .statusCode(204);
  }

  /** Mateu's fixed-name assets are revalidated ({@code no-cache}). */
  public void revalidatesFixedNameAssets(String assetPath) {
    given()
        .when()
        .get(assetPath)
        .then()
        .statusCode(200)
        .header("Cache-Control", containsString("no-cache"));
  }
}
