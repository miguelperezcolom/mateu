package io.mateu.core.application.runaction;

import static io.mateu.core.application.runaction.RunActionUseCase.RESTFETCH_ERROR_KEY;
import static io.mateu.core.application.runaction.RunActionUseCase.RESTFETCH_KEY;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.TemplateInterpolator;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RestDataSource;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Function;
import java.util.function.UnaryOperator;
import lombok.extern.slf4j.Slf4j;

/**
 * PROXY mode of the external-REST features: the server does the fetch the browser would otherwise
 * do, which resolves CORS (browser↔Mateu is same-origin) and injects {@code ${secret.X}} on the
 * server ({@link SecretResolver}) so a key never reaches the browser.
 *
 * <p>Two entry points, both answering the raw JSON body on {@code appData._restfetch} (or {@code
 * {status, message}} on {@code appData._restfetchError}):
 *
 * <ul>
 *   <li>{@link #fetch} — {@code __restfetch__}: the source a view DECLARES, resolved from the
 *       instance and the catalogue the server holds, never from a client-supplied url;
 *   <li>{@link #appSourceCall} — {@code _appsource}: a source the YAML app SHELL declares (its
 *       context pickers, notification inbox, palette search), named by role.
 * </ul>
 *
 * Both block on {@code java.net.http}: the caller moves them off the event loop.
 */
@Slf4j
final class RestProxyCalls {

  private static final HttpClient REST_HTTP =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  private static final ObjectMapper REST_MAPPER = new ObjectMapper();

  private final RestSourceRegistry restSourceRegistry;
  private final ActionInstanceCreator actionInstanceCreator;
  private final Function<String, String> secrets;

  RestProxyCalls(
      RestSourceRegistry restSourceRegistry,
      ActionInstanceCreator actionInstanceCreator,
      Function<String, String> secrets) {
    this.restSourceRegistry = restSourceRegistry;
    this.actionInstanceCreator = actionInstanceCreator;
    this.secrets = secrets;
  }

  /** A proxied REST call that failed: a >=400 upstream status, or a transport error (status 0). */
  static final class RestProxyException extends RuntimeException {
    final int status;

    /** What the service said about it (its error body), for the user; null when it said nothing. */
    final String detail;

    RestProxyException(int status, String message) {
      this(status, message, null);
    }

    RestProxyException(int status, String message, String detail) {
      super(message);
      this.status = status;
      this.detail = detail;
    }
  }

  /** {@code __restfetch__}: the source {@code instance} declares, called once or once per row. */
  UIIncrementDto fetch(Object instance, RunActionCommand command) {
    var params = parametersOf(command);
    var kind = String.valueOf(params.getOrDefault("_sourceKind", ""));
    var id = String.valueOf(params.getOrDefault("_sourceId", ""));
    var source = RestSourceResolver.resolve(instance, kind, id, restSourceRegistry.catalog());
    if (source == null) {
      return body(Map.of());
    }
    var state = callState(command.componentState(), params);
    // SAMPLE mode (opt-in only, see SampleSources): a source carrying sample data answers with it
    // instead of being called — the proxied twin of the browser's short-circuit in
    // fetchExternalJson, so both legs agree. A read gets the sample; a write (and a bulk one)
    // succeeds without persisting anything.
    if (SampleSources.enabled() && source.carriesSample()) {
      return sampleAnswer(source);
    }
    // Bulk (forEachSelectedRow): the loop runs on the SERVER, once per selected listing row, each
    // row merged OVER the component state so a per-id url like `.../people/${state.id}` resolves to
    // that row's id. Doing it here — rather than firing N calls from the browser — keeps the secret
    // server-side, needs a single round trip, and sidesteps the client's write-exclusivity guard
    // (which would otherwise drop all but the first of N identical `__restfetch__` actions).
    if (Boolean.parseBoolean(String.valueOf(params.get("_forEachSelectedRow")))) {
      return forEachSelectedRow(source, state);
    }
    try {
      return body(performRestCall(source, state));
    } catch (RestProxyException e) {
      return restFetchError(e.status, "Request failed" + statusSuffix(e.status), e.detail);
    }
  }

  private UIIncrementDto forEachSelectedRow(RestDataSource source, Map<String, Object> state) {
    var list = state.get("crud_selected_items") instanceof List<?> l ? l : List.of();
    int failed = 0;
    RestProxyException firstError = null;
    for (var row : list) {
      var rowState = new LinkedHashMap<String, Object>(state);
      if (row instanceof Map<?, ?> map) {
        map.forEach((k, v) -> rowState.put(String.valueOf(k), v));
      }
      try {
        performRestCall(source, rowState);
      } catch (RestProxyException e) {
        failed++;
        if (firstError == null) {
          firstError = e;
        }
      }
    }
    if (failed > 0) {
      // A failed row must not read as success: surface it rather than reload as if all deleted.
      return restFetchError(
          firstError.status,
          failed + " of " + list.size() + " failed" + statusSuffix(firstError.status),
          firstError.detail);
    }
    // The rows are gone; the client reloads the listing via successRoute, so no body is needed.
    return body(Map.of());
  }

  /**
   * {@code _appsource}: a data-authored shell (type: AppShell) feeds its context pickers,
   * notification inbox and palette search from REST sources. A DIRECT source is fetched by the
   * browser; a PROXIED one comes here: the browser names the ROLE (and the picker's field), never a
   * url — the source is the one the SHELL declares, resolved against the catalogue the server
   * holds, so this can no more be turned into an open relay than {@code __restfetch__} can.
   *
   * <p>The shell and its source are resolved NOW, on the request's thread (its class loader is the
   * one the specs are read with); only the returned blocking call is meant for another thread.
   */
  Callable<UIIncrementDto> appSourceCall(RunActionCommand command) {
    var params = parametersOf(command);
    var shell = actionInstanceCreator.declaredShellFor(command.route());
    var declared =
        AppShellSources.declared(
            shell,
            String.valueOf(params.getOrDefault("_appSource", "")),
            String.valueOf(params.getOrDefault("_field", "")));
    if (declared == null) {
      return () -> restFetchError(404, "The app shell declares no such source");
    }
    var source =
        declared.hasRef()
            ? restSourceRegistry
                .catalog()
                .get(declared.ref())
                .map(declared::resolvedAgainst)
                .orElse(declared)
            : declared;
    if (SampleSources.enabled() && source.carriesSample()) {
      var answer = sampleAnswer(source);
      return () -> answer;
    }
    // the variables the browser interpolates with (searchText, ids…), minus the routing keys
    var state = new LinkedHashMap<String, Object>();
    params.forEach(
        (key, value) -> {
          if (!key.startsWith("_")) {
            state.put(key, value);
          }
        });
    return () -> {
      try {
        return body(performRestCall(source, state));
      } catch (RestProxyException e) {
        return restFetchError(e.status, "Request failed" + statusSuffix(e.status), e.detail);
      }
    };
  }

  /** The proxy's own routing keys: what to call, never a value to interpolate. */
  private static final java.util.Set<String> ROUTING_PARAMETERS =
      java.util.Set.of("_sourceKind", "_sourceId", "_forEachSelectedRow");

  /**
   * The state a call interpolates with: the component state with the action's parameters over it —
   * a kanban move's {@code _cardId}/{@code _toColumnId} and the moved card's row reach {@code
   * ${state._toColumnId}} exactly as they do on the browser's direct leg (mateu-component merges
   * them the same way).
   */
  static Map<String, Object> callState(
      Map<String, Object> componentState, Map<String, Object> params) {
    var state = new LinkedHashMap<String, Object>();
    if (componentState != null) {
      state.putAll(componentState);
    }
    params.forEach(
        (key, value) -> {
          if (!ROUTING_PARAMETERS.contains(key)) {
            state.put(key, value);
          }
        });
    return state;
  }

  private static Map<String, Object> parametersOf(RunActionCommand command) {
    var rq = command.httpRequest() != null ? command.httpRequest().runActionRq() : null;
    return rq != null && rq.parameters() != null ? rq.parameters() : Map.of();
  }

  /** A sample-mode answer: the sample for a read, an empty success for a write. */
  private static UIIncrementDto sampleAnswer(RestDataSource source) {
    var method = source.method() == null ? "GET" : source.method().trim().toUpperCase();
    Object body = "GET".equals(method) || method.isEmpty() ? source.sample() : Map.of();
    return body(body);
  }

  private static UIIncrementDto body(Object body) {
    return UIIncrementDto.builder().appData(Map.of(RESTFETCH_KEY, body)).build();
  }

  private static String statusSuffix(int status) {
    return status > 0 ? " (HTTP " + status + ")" : "";
  }

  private static UIIncrementDto restFetchError(int status, String message) {
    return restFetchError(status, message, null);
  }

  /**
   * The failure the client shows. {@code detail} is what the SERVICE said (its error body, see
   * {@link #serviceMessageOf}): the user reads "Image larger than 2 MB", not "Request failed (HTTP
   * 400)". Only the upstream's message travels — never its headers or the url we called.
   */
  private static UIIncrementDto restFetchError(int status, String message, String detail) {
    var error = new LinkedHashMap<String, Object>();
    error.put("status", status);
    error.put("message", message);
    if (detail != null) {
      error.put("detail", detail);
    }
    return UIIncrementDto.builder().appData(Map.of(RESTFETCH_ERROR_KEY, error)).build();
  }

  private static final int SERVICE_MESSAGE_MAX = 300;

  /**
   * What an error body says, for a person: a JSON object's {@code message}, {@code detail} (RFC
   * 7807), {@code error} (a string, or an object with a message) or {@code title}; else the body
   * itself when it is short plain text (never HTML). Control characters out, at most 300
   * characters; null when there is nothing worth showing. The browser applies the same rule to a
   * direct call (libs/mateu {@code serviceMessage.ts}, Redwood {@code serviceMessageOf}).
   */
  static String serviceMessageOf(String body) {
    if (body == null || body.isBlank()) {
      return null;
    }
    var text = body.trim();
    if (text.startsWith("{")) {
      try {
        var json = REST_MAPPER.readTree(text);
        for (var key : List.of("message", "detail", "error", "title")) {
          var value = json.get(key);
          if (value != null && value.isTextual() && !value.asText().isBlank()) {
            return clipped(value.asText());
          }
          if (value != null && value.isObject()) {
            var nested = value.get("message");
            if (nested != null && nested.isTextual() && !nested.asText().isBlank()) {
              return clipped(nested.asText());
            }
          }
        }
      } catch (Exception e) {
        return null;
      }
      return null;
    }
    if (text.startsWith("<") || text.startsWith("[") || text.length() > SERVICE_MESSAGE_MAX) {
      return null;
    }
    return clipped(text);
  }

  private static String clipped(String text) {
    var clean = text.replaceAll("[\\p{Cntrl}&&[^\\n]]", "").replaceAll("\\s+", " ").trim();
    if (clean.isEmpty()) {
      return null;
    }
    return clean.length() > SERVICE_MESSAGE_MAX
        ? clean.substring(0, SERVICE_MESSAGE_MAX - 1) + "…"
        : clean;
  }

  /**
   * One proxied REST call: interpolate the resolved source's url/headers/body against {@code state}
   * (with {@code ${secret.X}} resolved server-side) and send it, returning the parsed JSON
   * response. Throws {@link RestProxyException} on a >=400 status or a transport failure — the
   * caller decides how to surface it, rather than an empty body being mistaken for success. The
   * single unit both the single-fetch and bulk paths reuse.
   */
  private Object performRestCall(RestDataSource source, Map<String, Object> state) {
    var method =
        source.method() == null || source.method().isBlank()
            ? "GET"
            : source.method().toUpperCase();
    // Logged by its TEMPLATE, never the resolved url: that may carry a ${secret.X} in its query.
    var url = source.url();
    try {
      // Values are percent-encoded by position (TemplateInterpolator.interpolateUrl), so a value
      // from the client state cannot add path segments, a query or another host to the request.
      var resolvedUrl = TemplateInterpolator.interpolateUrl(source.url(), state, secrets);
      var builder =
          java.net.http.HttpRequest.newBuilder()
              .uri(java.net.URI.create(resolvedUrl))
              .timeout(Duration.ofSeconds(60))
              .header("Accept", "application/json");
      if (source.headers() != null) {
        for (var e : source.headers().entrySet()) {
          builder.header(
              e.getKey(), TemplateInterpolator.interpolate(e.getValue(), state, secrets));
        }
      }
      if (!"GET".equals(method)
          && !"HEAD".equals(method)
          && source.body() != null
          && !source.body().isBlank()) {
        // The values go into the body ESCAPED when the request declares JSON: a name with a quote
        // or a description with a newline would otherwise close the string early and the endpoint
        // would answer 400 with nothing on screen to say why. Only the values — the template's own
        // punctuation is what gives the body its shape.
        var escape =
            TemplateInterpolator.declaresJson(source.headers())
                ? (UnaryOperator<String>) TemplateInterpolator::jsonEscape
                : UnaryOperator.<String>identity();
        builder.method(
            method,
            java.net.http.HttpRequest.BodyPublishers.ofString(
                TemplateInterpolator.interpolate(source.body(), state, secrets, escape)));
      } else {
        builder.method(method, java.net.http.HttpRequest.BodyPublishers.noBody());
      }
      var response =
          REST_HTTP.send(builder.build(), java.net.http.HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() >= 400) {
        throw new RestProxyException(
            response.statusCode(),
            "HTTP " + response.statusCode(),
            serviceMessageOf(response.body()));
      }
      return parseBody(response.body());
    } catch (RestProxyException e) {
      log.warn("proxy rest fetch failed: {} url={} method={}", e.getMessage(), url, method);
      throw e;
    } catch (Exception e) {
      log.warn("proxy rest fetch failed: {} url={} method={}", e.getMessage(), url, method);
      throw new RestProxyException(0, e.getMessage());
    }
  }

  /**
   * What a proxied response's body becomes.
   *
   * <p>An empty body is a legitimate success, not something to parse: <b>204 No Content</b> is
   * exactly what a DELETE answers. Feeding "" to the mapper threw, and on the bulk path a throw is
   * counted as a failed row — so a delete that had deleted everything asked of it reported "1 of 1
   * failed", with the rows already gone and the screen saying they were not. Malformed JSON still
   * fails: an empty body is the exception, not a blanket amnesty.
   */
  static Object parseBody(String body) throws java.io.IOException {
    if (body == null || body.isBlank()) {
      return Map.of();
    }
    return REST_MAPPER.readValue(body, Object.class);
  }
}
