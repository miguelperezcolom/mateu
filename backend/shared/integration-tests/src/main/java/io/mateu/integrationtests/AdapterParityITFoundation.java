package io.mateu.integrationtests;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
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
   * An {@code actionId} that names nothing on {@code @UI("/restricted")} — no method, no field, no
   * handler, not advertised — is a refused request (403), never a 200 that re-renders the page as
   * if something had run.
   */
  public void refusesAnActionIdThatNamesNothing() {
    given()
        .contentType(ContentType.JSON)
        .body(action("noSuchThing"))
        .when()
        .post("/restricted/mateu/v3/sync/_no_route")
        .then()
        .statusCode(403)
        .body(not(containsString("visibleField")));
  }

  /**
   * The same refusal on the STREAMED leg ({@code /v3/sse/}, the one a LongTask / {@code Action.sse}
   * uses): 403 too. A streamed route produces {@code text/event-stream}, and an adapter whose
   * forbidden handler only answers other media types (or that commits the stream before the request
   * is guarded) answered 500.
   */
  public void refusesARestrictedStreamedActionToAnAnonymousCaller() {
    given()
        .contentType(ContentType.JSON)
        .accept("text/event-stream")
        .body(action("adminAction"))
        .when()
        .post("/restricted/mateu/v3/sse/_no_route")
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

  /**
   * What a UI method reads off its {@code HttpRequest} is the HTTP request the adapter received —
   * on the sync AND the streamed leg (a different code path on Helidon). The fixture is
   * {@code @UI("/echo")} with an action {@code echo(HttpRequest)} answering the message {@link
   * #ECHO_EXPECTED} built from: the query parameter {@code q}, the repeated parameter {@code tag},
   * whether {@code q} is among the parameter names, the header {@code X-Echo}, the repeated header
   * {@code X-Multi}, an absent parameter and header (null / empty list — never an exception), and
   * whether {@code path()} ends with the route segment.
   */
  public void passesTheHttpRequestToTheUi() {
    for (String leg : new String[] {"sync", "sse"}) {
      given()
          .contentType(ContentType.JSON)
          .accept("sse".equals(leg) ? "text/event-stream" : "application/json")
          .queryParam("q", "hello")
          .queryParam("tag", "a", "b")
          .header("X-Echo", "hola")
          .header("X-Multi", "one")
          .header("X-Multi", "two")
          // a client claiming another address: by default the adapter reads the SOCKET's, never
          // a header anyone can set (live push and the client-log limits are keyed on it)
          .header("X-Forwarded-For", "203.0.113.9")
          .header("Forwarded", "for=203.0.113.9")
          .header("X-Real-IP", "203.0.113.9")
          .body(action("echo"))
          .when()
          .post("/echo/mateu/v3/" + leg + "/_no_route")
          .then()
          .statusCode(200)
          .body(containsString(ECHO_EXPECTED));
    }
  }

  /**
   * The message {@code @UI("/echo")}'s {@code echo} answers for {@link
   * #passesTheHttpRequestToTheUi}.
   */
  public static final String ECHO_EXPECTED =
      "q=hello;tags=a,b;named=true;header=hola;multi=one,two;"
          + "absentParam=null;absentParams=0;absentHeader=null;absentHeaders=0;path=true;"
          + "remote=local";

  /**
   * The text {@code echo(HttpRequest)} answers — kept here so the five adapters' fixtures build it
   * the same way. A repeated value must arrive as one entry per occurrence.
   */
  public static String echo(io.mateu.uidl.interfaces.HttpRequest rq) {
    return "q="
        + rq.getParameterValue("q")
        + ";tags="
        + String.join(",", rq.getParameterValues("tag"))
        + ";named="
        + rq.getParameterNames().contains("q")
        + ";header="
        + rq.getHeaderValue("X-Echo")
        + ";multi="
        + String.join(",", rq.getHeaderValues("X-Multi"))
        + ";absentParam="
        + rq.getParameterValue("absent")
        + ";absentParams="
        + rq.getParameterValues("absent").size()
        + ";absentHeader="
        + rq.getHeaderValue("X-Absent")
        + ";absentHeaders="
        + rq.getHeaderValues("X-Absent").size()
        + ";path="
        + (rq.path() != null && rq.path().endsWith("_no_route"))
        + ";remote="
        + localOr(rq.getRemoteAddress());
  }

  /** {@code local} for a loopback address (the tests' client), else the address as given. */
  private static String localOr(String address) {
    if (address == null) {
      return "null";
    }
    var a = address.trim();
    if (a.startsWith("/")) {
      a = a.substring(1);
    }
    return a.startsWith("127.")
            || a.equals("::1")
            || a.equals("0:0:0:0:0:0:0:1")
            || a.equals("[::1]")
        ? "local"
        : a;
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

  /**
   * The content types a cross-site page can send WITHOUT a CORS preflight ({@code text/plain}, the
   * two form encodings, or no Content-Type at all), each with a perfectly valid JSON body.
   */
  private static final String[] SIMPLE_REQUEST_CONTENT_TYPES = {
    "text/plain", "application/x-www-form-urlencoded", "multipart/form-data; boundary=x", null
  };

  /**
   * The sync and SSE endpoints answer 415 to any body that is not declared JSON: a CORS-simple
   * request (which a cross-site page can make the browser send with the user's cookies) never
   * reaches an action. This is the control {@code CsrfExemption} relies on, so it must hold on
   * every adapter, not only where Spring's {@code @RequestBody} happens to give it for free.
   */
  public void refusesANonJsonBodyOnTheSyncAndSseEndpoints() throws Exception {
    for (String path :
        new String[] {"/hello/mateu/v3/sync/_no_route", "/hello/mateu/v3/sse/_no_route"}) {
      for (String contentType : SIMPLE_REQUEST_CONTENT_TYPES) {
        var status = postRaw(path, contentType, RQ);
        if (status != 415) {
          throw new AssertionError(
              path + " with Content-Type " + contentType + " answered " + status + ", not 415");
        }
      }
    }
  }

  /** The same 415 on {@code POST /mateu/mcp} (with the endpoint enabled). */
  public void refusesANonJsonBodyOnTheMcpEndpoint() throws Exception {
    var call =
        "{\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"tools/call\",\"params\":"
            + "{\"name\":\"mateu_run_action\",\"arguments\":{\"route\":\"/hello\","
            + "\"actionId\":\"x\"}}}";
    for (String contentType : SIMPLE_REQUEST_CONTENT_TYPES) {
      var status = postRaw("/mateu/mcp", contentType, call);
      if (status != 415) {
        throw new AssertionError(
            "/mateu/mcp with Content-Type " + contentType + " answered " + status + ", not 415");
      }
    }
    // and a JSON one with parameters still works
    var status =
        postRaw(
            "/mateu/mcp",
            "application/json; charset=utf-8",
            "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}");
    if (status != 200) {
      throw new AssertionError("a JSON MCP call answered " + status);
    }
  }

  /** A POST with exactly this Content-Type header (none when null); answers the status. */
  private static int postRaw(String path, String contentType, String body) throws Exception {
    var builder =
        java.net.http.HttpRequest.newBuilder(
                URI.create("http://localhost:" + RestAssured.port + path))
            .timeout(java.time.Duration.ofSeconds(20))
            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body));
    if (contentType != null) {
      builder.header("Content-Type", contentType);
    }
    return HttpClient.newHttpClient()
        .send(builder.build(), HttpResponse.BodyHandlers.discarding())
        .statusCode();
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
    // a body that is not JSON is a JSON-RPC parse error, not an HTTP failure
    given()
        .contentType(ContentType.JSON)
        .body("{not json")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(200)
        .body(containsString("-32700"));
    // the authoring plane: the resources ship in the app, and validation reaches the app's
    // validator through its own sync path (the reserved __validate__ action)
    given()
        .contentType(ContentType.JSON)
        .body("{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"resources/list\"}")
        .when()
        .post("/mateu/mcp")
        .then()
        .statusCode(200)
        .body(containsString("mateu://schema/specs"));
    mcpToolCall(
            "mateu_validate_uidl",
            "{\"yaml\":\"type: FormField\\nid: price\\ndataType: decimal\\n\"}")
        .body(containsString("invalid_value"))
        .body(containsString("\\\"line\\\" : 3"));
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
   * POST /mateu/dev/reload} answers 204 and is pushed to the open stream as a {@code reload} event
   * — with the {@code scope=app} it was asked with.
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
        // the IDE asks for a whole-app re-render with ?scope=app
        given().queryParam("scope", "app").when().post("/mateu/dev/reload").then().statusCode(204);
        do {
          event = nextData(executor, it);
        } while (event.contains("\"ping\""));
        if (!event.contains("\"reload\"") || !event.contains("\"scope\":\"app\"")) {
          throw new AssertionError("an app-scoped reload was not pushed as such: " + event);
        }
      }
    } finally {
      executor.shutdownNow();
    }
  }

  /**
   * With {@code mateu.mcp.enabled=true} and {@code mateu.mcp.push.enabled=true} (live UI push): a
   * UI session opens its channel ({@code _agent-channel}) over THIS adapter's SSE endpoint, asks
   * for a pairing code over its sync endpoint, an anonymous MCP caller pairs with it and pushes a
   * screen — and the screen arrives on the open stream as an {@code AgentPush} {@code
   * render-screen}.
   */
  public void pushesUiToALiveSessionOverTheSseStream() throws Exception {
    var sessionId = "parity-" + System.nanoTime();
    var parameters =
        "{\"sessionId\":\""
            + sessionId
            + "\",\"secret\":\"parity-secret\",\"route\":\"/hello\",\"renderer\":\"parity\"}";
    var channel =
        "{\"route\":\"/hello\",\"actionId\":\"_agent-channel\",\"componentState\":{},"
            + "\"appState\":{},\"parameters\":"
            + parameters
            + "}";
    var client = HttpClient.newHttpClient();
    var request =
        java.net.http.HttpRequest.newBuilder(
                URI.create(
                    "http://localhost:" + RestAssured.port + "/hello/mateu/v3/sse/_no_route"))
            .header("Accept", "text/event-stream")
            .header("Content-Type", "application/json")
            .POST(java.net.http.HttpRequest.BodyPublishers.ofString(channel))
            .build();
    ExecutorService executor = Executors.newSingleThreadExecutor();
    try {
      var response =
          executor
              .submit(() -> client.send(request, HttpResponse.BodyHandlers.ofLines()))
              .get(20, TimeUnit.SECONDS);
      if (response.statusCode() != 200) {
        throw new AssertionError("the agent channel answered " + response.statusCode());
      }
      try (var lines = response.body()) {
        var it = lines.iterator();
        var status = nextData(executor, it);
        if (!status.contains("AgentPush") || !status.contains("mateu-agent-status")) {
          throw new AssertionError("the channel did not start with its status: " + status);
        }
        var pairing =
            given()
                .contentType(ContentType.JSON)
                .body(
                    "{\"route\":\"/hello\",\"actionId\":\"_agent-pair\",\"componentState\":{},"
                        + "\"appState\":{},\"parameters\":"
                        + parameters
                        + "}")
                .when()
                .post("/hello/mateu/v3/sync/_no_route")
                .then()
                .statusCode(200)
                .extract()
                .asString();
        var code = pairing.replaceAll("(?s).*\"code\"\\s*:\\s*\"([A-Z0-9-]+)\".*", "$1");
        if (!code.matches("[A-Z0-9]{4}-[A-Z0-9]{4}")) {
          throw new AssertionError("no pairing code in " + pairing);
        }
        var paired =
            mcpToolCall("mateu_pair_session", "{\"code\":\"" + code + "\"}").extract().asString();
        var handle =
            paired.replaceAll(
                "(?s).*\\\\\"session\\\\\"\\s*:\\s*\\\\\"([A-Za-z0-9_-]+)\\\\\".*", "$1");
        if (handle.equals(paired)) {
          throw new AssertionError("pairing did not answer a session: " + paired);
        }
        mcpToolCall(
                "mateu_push_ui",
                "{\"session\":\""
                    + handle
                    + "\",\"yaml\":\"type: Text\\ntext: Pushed by an agent\\n\",\"target\":\"drawer\"}")
            .body(containsString("\\\"delivered\\\" : true"));
        // the pairing's status comes first, maybe a heartbeat: read on until the screen
        String event = "";
        for (int i = 0; i < 10 && !event.contains("render-screen"); i++) {
          event = nextData(executor, it);
        }
        if (!event.contains("render-screen") || !event.contains("Pushed by an agent")) {
          throw new AssertionError("the pushed screen did not reach the stream: " + event);
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

  /**
   * A deep link whose record id carries a space, an accent, a {@code +}, {@code ~}, {@code :} or
   * {@code @} answers the index like any other (Micronaut answered 404 for them).
   */
  public void answersDeepLinksWithEncodedSegments() {
    given()
        .urlEncodingEnabled(false)
        .accept("text/html")
        .when()
        .get("/hello/stays/Jos%C3%A9%20A+B~c:d@e")
        .then()
        .statusCode(200)
        .body(containsString("<mateu-ui baseUrl=\"/hello\""));
  }

  /**
   * A DATA fetch of a path nobody serves (a REST source pointing at an endpoint that does not exist
   * yet) is NOT answered with the index page: a 200 of HTML made the missing endpoint look like an
   * empty one, with nothing in any log. Only a navigation (Accept: text/html) gets the index.
   */
  public void doesNotAnswerADataFetchWithTheIndex() {
    var response =
        given().accept("application/json, text/plain, */*").when().get("/hello/some/deep/link");
    var contentType = String.valueOf(response.getContentType());
    if (response.getStatusCode() == 200 && contentType.startsWith("text/html")) {
      throw new AssertionError(
          "a data fetch of an unknown path was answered with the index page: " + contentType);
    }
  }

  /**
   * {@code GET <baseUrl>/mateu/v3/manifest}: the Mateu mobile app's manifest, public and cacheable,
   * the same JSON on every adapter ({@code io.mateu.core.infra.MobileManifest}) — also for a
   * request that asks for HTML, which must never get the index page. The fixture is
   * {@code @UI("/plain") @Title("Plain form")} with no {@code @MobileApp} and no {@code
   * mateu.mobile.*} settings.
   */
  public void servesTheMobileManifest() {
    for (String accept : new String[] {"application/json", "text/html"}) {
      given()
          .accept(accept)
          .when()
          .get("/plain/mateu/v3/manifest")
          .then()
          .statusCode(200)
          .header("Content-Type", startsWith("application/json"))
          .header("Cache-Control", equalTo("public, max-age=300"))
          .header("X-Content-Type-Options", equalTo("nosniff"))
          .body(
              equalTo(
                  "{\"name\":\"Plain form\",\"shortName\":\"Plain form\",\"wireVersion\":\"3.0\","
                      + "\"minAppVersion\":\"1.0.0\"}"));
    }
  }

  /**
   * Mateu's own settings are read from the FRAMEWORK's configuration ({@code
   * application.properties} / {@code application.yml} / MicroProfile Config), not only from JVM
   * system properties and environment variables: run with {@code
   * mateu.mobile.min-app-version=2.5.0} set there, the manifest carries it. (Before, {@code
   * mateu.actions.strict}, {@code mateu.errors.detailed} & co. written in {@code
   * application.properties} were silently ignored.)
   */
  public void readsMateuSettingsFromTheFrameworkConfiguration() {
    given()
        .accept("application/json")
        .when()
        .get("/plain/mateu/v3/manifest")
        .then()
        .statusCode(200)
        .body(containsString("\"minAppVersion\":\"2.5.0\""));
  }

  /**
   * {@code GET /mateu/v3/bundle}: the static bundle rendered live ({@code MateuBundleExporter}) —
   * the {@code manifest.json} the {@code mateu:bundle} goal writes, with an entry per served
   * {@code @UI} — with and without the parameterised routes, the same body on a second (cached)
   * request. The body is parsed, not only searched: it is a JSON object whose {@code entries} list
   * is not empty and which never carries the {@code error} member of the failure answer ({@code
   * io.mateu.core.infra.BundleEndpoint}, shared by every adapter); with {@code ?params=true} it
   * bundles at least every route the plain variant does.
   */
  public void servesTheRuntimeBundle() {
    int plainEntries = -1;
    for (String params : new String[] {"false", "true"}) {
      var response =
          given()
              .queryParam("params", params)
              .when()
              .get("/mateu/v3/bundle")
              .then()
              .statusCode(200)
              .header("Content-Type", startsWith("application/json"))
              .body(containsString("Plain form"))
              .body("error", nullValue())
              .body("entries.size()", greaterThan(0))
              .extract();
      String first = response.asString();
      int entries = response.jsonPath().getList("entries").size();
      if (plainEntries < 0) {
        plainEntries = entries;
      } else {
        assertThat(
            "entries bundled with ?params=true", entries, greaterThanOrEqualTo(plainEntries));
      }
      given()
          .queryParam("params", params)
          .when()
          .get("/mateu/v3/bundle")
          .then()
          .statusCode(200)
          .body(equalTo(first));
    }
  }

  /** The base path of the YAML mount fixture ({@code specs/ui/yaml-parity.ui.yaml}). */
  public static final String YAML_MOUNT = "/yaml-parity";

  private static final String YAML_MOUNT_TITLE = "YAML parity";

  private static String yamlPageRq(String consumedRoute) {
    return "{\"route\": \"/page\", \"consumedRoute\": \""
        + consumedRoute
        + "\", \"actionId\": \"\", \"componentState\": {}, \"parameters\": {},"
        + " \"appState\": {}}";
  }

  /**
   * The surface of a deployment with no Java {@code @UI} ({@code io.mateu.core.infra.YamlMounts}):
   * a {@code type: UI} mount at {@value #YAML_MOUNT} whose root binds an app shell titled "YAML
   * parity" and whose {@code page} route a definition with the text "YAML parity page". Its SPA
   * shell (and deep links under it), its mobile manifest — JSON even for a request asking for HTML,
   * named after the shell —, and its sync and SSE API, which resolve routes RELATIVE to the mount:
   * a fresh deep link to {@code /page} answers the shell aimed at {@code /yaml-parity/page}, and
   * the content load that follows answers the page.
   */
  public void servesAYamlMount() {
    for (String path : new String[] {YAML_MOUNT, YAML_MOUNT + "/page"}) {
      given()
          .accept("text/html")
          .when()
          .get(path)
          .then()
          .statusCode(200)
          .header("Content-Type", startsWith("text/html"))
          .body(containsString("<mateu-ui baseUrl=\"" + YAML_MOUNT + "\""))
          .body(containsString("<title>" + YAML_MOUNT_TITLE + "</title>"));
    }
    // a data fetch under the mount is not a deep link: no index page for it
    var fetched = given().accept("application/json, */*").when().get(YAML_MOUNT + "/page");
    if (fetched.getStatusCode() == 200
        && String.valueOf(fetched.getContentType()).startsWith("text/html")) {
      throw new AssertionError("a data fetch under the YAML mount was answered with the index");
    }
    for (String accept : new String[] {"application/json", "text/html"}) {
      given()
          .accept(accept)
          .when()
          .get(YAML_MOUNT + "/mateu/v3/manifest")
          .then()
          .statusCode(200)
          .header("Content-Type", startsWith("application/json"))
          .header("Cache-Control", equalTo("public, max-age=300"))
          .header("X-Content-Type-Options", equalTo("nosniff"))
          .body(
              equalTo(
                  "{\"name\":\""
                      + YAML_MOUNT_TITLE
                      + "\",\"shortName\":\""
                      + YAML_MOUNT_TITLE
                      + "\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\"}"));
    }
    given()
        .contentType(ContentType.JSON)
        .body(yamlPageRq("_empty"))
        .when()
        .post(YAML_MOUNT + "/mateu/v3/sync/_no_route")
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("application/json"))
        .body(containsString("\"title\":\"" + YAML_MOUNT_TITLE + "\""))
        .body(containsString("\"homeRoute\":\"" + YAML_MOUNT + "/page\""));
    given()
        .contentType(ContentType.JSON)
        .accept("text/event-stream")
        .body(yamlPageRq(""))
        .when()
        .post(YAML_MOUNT + "/mateu/v3/sse/_no_route")
        .then()
        .statusCode(200)
        .header("Content-Type", startsWith("text/event-stream"))
        .body(startsWith("data:"))
        .body(containsString("YAML parity page"));
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

  /**
   * A content-versioned path ({@code /version_<n>/…}, cached for a year when found) that does not
   * exist is NOT answered as immutable: a cached 404 would keep the asset missing for a year after
   * it is deployed.
   */
  public void neverCachesAMissingVersionedAsset() {
    var response = given().when().get("/version_999/missing.js");
    if (response.getStatusCode() == 200) {
      throw new AssertionError("a missing versioned asset answered 200");
    }
    var cacheControl = String.valueOf(response.getHeader("Cache-Control"));
    if (cacheControl.contains("immutable")) {
      throw new AssertionError("a missing versioned asset was cached: " + cacheControl);
    }
  }

  /**
   * A renderer asset is served from the classpath {@code static/} folder the renderer jars carry it
   * in (once — no second copy under {@code META-INF/resources}), as JavaScript (a module script
   * with another type does not run) and with the revalidate policy.
   */
  public void servesARendererAssetFromTheClasspathStaticFolder(String assetPath) {
    given()
        .when()
        .get(assetPath)
        .then()
        .statusCode(200)
        .header("Content-Type", containsString("javascript"))
        .header("Cache-Control", containsString("no-cache"));
  }

  /**
   * An unchanged fixed-name asset costs a 304 with no body when the browser revalidates it with the
   * validator it was given (an {@code ETag}, else {@code Last-Modified}), and the 304 keeps the
   * revalidate policy.
   */
  public void answersARevalidationOfAnUnchangedAssetWith304(String assetPath) {
    var first = given().when().get(assetPath);
    first.then().statusCode(200);
    var etag = first.getHeader("ETag");
    var lastModified = first.getHeader("Last-Modified");
    var revalidation = given();
    if (etag != null) {
      revalidation.header("If-None-Match", etag);
    } else if (lastModified != null) {
      revalidation.header("If-Modified-Since", lastModified);
    } else {
      throw new AssertionError(assetPath + " was served with no validator to revalidate it with");
    }
    revalidation
        .when()
        .get(assetPath)
        .then()
        .statusCode(304)
        .header("Cache-Control", containsString("no-cache"));
  }

  /**
   * With {@code mateu.cors.allowed-origins=}{@value #ALLOWED_ORIGIN}: the grant covers Mateu's API
   * ({@code /mateu/**}) only — an asset or a UI's index page fetched from that origin carries no
   * {@code Access-Control-Allow-Origin}.
   */
  public void grantsNoCrossOriginAccessOutsideTheMateuApi(String assetPath) {
    for (String path : new String[] {assetPath, "/hello"}) {
      given()
          .header("Origin", ALLOWED_ORIGIN)
          .accept("text/html, */*")
          .when()
          .get(path)
          .then()
          .header("Access-Control-Allow-Origin", nullValue());
    }
  }

  /** With {@code mateu.client-log.enabled=false} the renderer's reports are not accepted (404). */
  public void refusesClientLogsWhenDisabled() {
    given()
        .contentType(ContentType.JSON)
        .body("{\"kind\":\"timeout\",\"message\":\"slow\"}")
        .when()
        .post("/hello/mateu/v3/client-log")
        .then()
        .statusCode(404);
  }

  /**
   * With {@code mateu.static-assets.caching=false} Mateu sets no cache policy of its own on a
   * fixed-name asset (whatever the framework or a security filter adds is left alone).
   */
  public void setsNoCachePolicyWhenCachingIsOff(String assetPath) {
    given()
        .when()
        .get(assetPath)
        .then()
        .statusCode(200)
        .header("Cache-Control", not(equalTo("no-cache")));
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
