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

  /**
   * An UNSIGNED Bearer token claiming {@code roles: [admin]} reveals nothing restricted: with no
   * verifier configured (the test apps configure none) Mateu ignores the token's claims. The
   * fixture is {@code @UI("/restricted")} with a public {@code visibleField} and an
   * {@code @EyesOnly(roles = "admin") adminOnlyField}.
   */
  public void aForgedBearerTokenRevealsNothing() {
    var enc = java.util.Base64.getUrlEncoder().withoutPadding();
    var forged =
        enc.encodeToString("{\"alg\":\"none\"}".getBytes(java.nio.charset.StandardCharsets.UTF_8))
            + "."
            + enc.encodeToString(
                "{\"sub\":\"mallory\",\"roles\":[\"admin\"],\"realm_access\":{\"roles\":[\"admin\"]}}"
                    .getBytes(java.nio.charset.StandardCharsets.UTF_8))
            + ".";
    given()
        .contentType(ContentType.JSON)
        .header("Authorization", "Bearer " + forged)
        .body(
            "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \"\","
                + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}")
        .when()
        .post("/restricted/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("visibleField"))
        .body(not(containsString("adminOnlyField")));
  }

  /**
   * The header each adapter's test app turns into an AUTHENTICATED principal carrying the listed
   * roles, the way its framework does it (a Spring Security {@code Authentication}, a WebFlux
   * exchange principal, Micronaut's request principal, a JAX-RS {@code SecurityContext}). The
   * contract below then checks that the principal reaches Mateu's authorization — the positive path
   * {@link #aForgedBearerTokenRevealsNothing} cannot see.
   */
  public static final String PARITY_ROLES_HEADER = "X-Parity-Roles";

  private static String action(String actionId) {
    return "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \""
        + actionId
        + "\", \"componentState\": {}, \"parameters\": {}, \"appState\": {}}";
  }

  /**
   * An {@code @EyesOnly(roles = "admin")} action of {@code @UI("/restricted")} ({@code
   * adminAction}, answering the message {@code "admin action ran"}) is REFUSED with 403 for an
   * anonymous caller — the method never runs — even though nothing on screen offers it.
   */
  public void refusesARestrictedActionToAnAnonymousCaller() {
    given()
        .contentType(ContentType.JSON)
        .body(action("adminAction"))
        .when()
        .post("/restricted/mateu/v3/sync/_no_route")
        .then()
        .statusCode(403)
        .body(not(containsString("admin action ran")));
  }

  /**
   * A caller the framework authenticated with the {@code admin} role (sent as {@code headers}, e.g.
   * {@link #PARITY_ROLES_HEADER}; empty when the test itself establishes the identity) sees the
   * {@code @EyesOnly} field and may run the restricted action: the framework's principal reaches
   * Mateu's authorization on this adapter.
   */
  public void anAuthenticatedPrincipalSeesAndRunsWhatItsRolesAllow(
      java.util.Map<String, String> headers) {
    given()
        .headers(headers)
        .contentType(ContentType.JSON)
        .body(action(""))
        .when()
        .post("/restricted/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("adminOnlyField"));
    given()
        .headers(headers)
        .contentType(ContentType.JSON)
        .body(action("adminAction"))
        .when()
        .post("/restricted/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("admin action ran"));
  }

  /**
   * The error boundary over HTTP. {@code @UI("/failing")} has an action {@code explode} that throws
   * {@code IllegalStateException("db password is hunter2")} and one, {@code refuse}, that throws a
   * {@code UserFacingException("The booking is already checked in")}: the first answers the generic
   * text with a reference id and never its message; the second shows its message as written.
   */
  public void answersAnUnexpectedErrorWithAReferenceNeverItsMessage() {
    given()
        .contentType(ContentType.JSON)
        .body(action("explode"))
        .when()
        .post("/failing/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("Something went wrong"))
        .body(containsString("Reference: "))
        .body(not(containsString("hunter2")))
        .body(not(containsString("IllegalStateException")));
    given()
        .contentType(ContentType.JSON)
        .body(action("refuse"))
        .when()
        .post("/failing/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("The booking is already checked in"));
  }

  /**
   * A third-party UI module ({@code @UI("/thirdparty") @Title("Third-party module")} in a package
   * the application does not scan) is served once the application names its package — {@code
   * mateu.ui.modules} or {@code @EnableMateuUiModules} on Spring; the container's own bean
   * discovery elsewhere.
   */
  public void servesANamedThirdPartyUiModule() {
    given()
        .contentType(ContentType.JSON)
        .body(
            "{\"route\": \"\", \"consumedRoute\": \"_empty\", \"actionId\": \"\","
                + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}")
        .when()
        .post("/thirdparty/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .body(containsString("Third-party module"));
  }

  /** ...and is NOT served while the application has not named it (no endpoint at all). */
  public void doesNotServeAnUnnamedThirdPartyUiModule() {
    given()
        .contentType(ContentType.JSON)
        .body(RQ)
        .when()
        .post("/thirdparty/mateu/v3/sync/_no_route")
        .then()
        .statusCode(not(equalTo(200)));
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

  private static io.restassured.response.ValidatableResponse mcpToolCall(
      String tool, String arguments) {
    return given()
        .contentType(ContentType.JSON)
        .body(
            "{\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"tools/call\",\"params\":{\"name\":\""
                + tool
                + "\",\"arguments\":"
                + arguments
                + "}}")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(200);
  }

  /**
   * With {@code mateu.mcp.enabled=true}, a tool call goes through the same authorization and error
   * boundary as the sync endpoint: an anonymous agent describing {@code /restricted} does not see
   * the {@code @EyesOnly} field, cannot run its restricted action, and a failing action answers the
   * generic text — never the exception's message.
   */
  public void mcpToolCallsApplyTheSameRbacAndErrorBoundary() {
    mcpToolCall("mateu_describe_screen", "{\"route\":\"restricted\"}")
        .body(containsString("visibleField"))
        .body(not(containsString("adminOnlyField")))
        .body(not(containsString("top-secret")));
    mcpToolCall("mateu_run_action", "{\"route\":\"restricted\",\"actionId\":\"adminAction\"}")
        .body(containsString("isError"))
        .body(not(containsString("admin action ran")));
    mcpToolCall("mateu_run_action", "{\"route\":\"failing\",\"actionId\":\"explode\"}")
        .body(containsString("Something went wrong"))
        .body(not(containsString("hunter2")));
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

  /**
   * A document an action parked is served ONCE under any UI's base URL, with a safe {@code
   * Content-Disposition}, {@code no-store} and {@code nosniff} — and even for a navigation that
   * asks for HTML (a new tab), never the index page. {@code token} was parked (in the server's JVM)
   * as {@code Document.attachment("Factura ñ.pdf", "application/pdf", "%PDF-1.4 parity")}.
   */
  public void servesAParkedDocumentOnce(String token) {
    String path = "/hello/mateu/v3/documents/" + token;
    given()
        .accept("text/html")
        .when()
        .get(path)
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("application/pdf"))
        .header(
            "Content-Disposition",
            equalTo(
                "attachment; filename=\"Factura _.pdf\"; filename*=UTF-8''Factura%20%C3%B1.pdf"))
        .header("Cache-Control", equalTo("no-store"))
        .header("X-Content-Type-Options", equalTo("nosniff"))
        .body(equalTo("%PDF-1.4 parity"));
    given().when().get(path).then().statusCode(404);
    given().when().get("/hello/mateu/v3/documents/unknown-token-0123456789").then().statusCode(404);
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
