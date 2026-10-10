package io.mateu.core.application.runaction;

import io.mateu.core.application.contract.ModelViewContractExtractor;
import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.infra.StructureHashPostProcessor;
import io.mateu.core.infra.TemplateInterpolator;
import io.mateu.dtos.ModelViewContractDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class RunActionUseCase {

  private final ActionRunnerProvider actionRunnerProvider;
  private final UiIncrementMapperProvider uiIncrementMapperProvider;
  private final ActionInstanceCreator actionInstanceCreator;
  private final YamlUidlLoader yamlUidlLoader;
  private final RestSourceRegistry restSourceRegistry;
  private final io.mateu.core.application.security.WireTypePolicy wireTypePolicy;

  // ── Public static helpers (used by other classes in the framework) ────────

  public static void setResolvedRoute(HttpRequest httpRequest, String route) {
    setResolvedRoute(httpRequest, route, true);
  }

  public static void setResolvedRoute(HttpRequest httpRequest, String route, boolean force) {
    if (force || httpRequest.getAttribute("resolvedRoute") == null) {
      httpRequest.setAttribute("resolvedRoute", route);
    }
  }

  public static void setResolvedPath(HttpRequest httpRequest, String path) {
    httpRequest.setAttribute("resolvedPath", path);
  }

  // Keep static wrap/getState here as a forwarding facade so existing callers compile unchanged.
  // The actual implementation lives in ComponentStateHelper.
  public static io.mateu.dtos.ServerSideComponentDto wrap(
      Component component,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentStateHelper.wrap(
        component, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  public static io.mateu.dtos.ServerSideComponentDto wrap(
      List<Component> components,
      Object modelView,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return ComponentStateHelper.wrap(
        components, modelView, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
  }

  public static Object getState(Object modelView, HttpRequest httpRequest) {
    return ComponentStateHelper.getState(modelView, httpRequest);
  }

  // ── Main entry point ──────────────────────────────────────────────────────

  public Flux<UIIncrementDto> handle(RunActionCommand incoming) {
    log.debug("run action {}", incoming.actionId());
    final RunActionCommand command;
    // The client names the server-side type it is talking to; only types the application exposes
    // may be resolved (C1). Refused here, before anything loads, instantiates or asks the
    // container for the class — every path below (contract, preview, rest proxy, actions) and
    // every entry point (the generated controllers, /mateu/mcp) goes through this method.
    try {
      wireTypePolicy.check(incoming.serverSideType(), incoming.route(), incoming.httpRequest());
      // the YAML access keys: a refused route / declared action answers 403, and fields locked
      // for the caller lose their client-sent values (the data twin of @EyesOnly & co.)
      command = yamlUidlLoader != null ? yamlUidlLoader.guard(incoming) : incoming;
    } catch (io.mateu.core.application.security.MateuForbiddenException e) {
      return Flux.error(e);
    }
    if (CONTRACT_ACTION.equals(command.actionId())) {
      return handleContract(command);
    }
    if (PREVIEW_ACTION.equals(command.actionId())) {
      return handlePreview(command);
    }
    if (RESTFETCH_ACTION.equals(command.actionId())) {
      return handleRestFetch(command);
    }
    return (Mono.just(command)
            .flatMap(ignored -> actionInstanceCreator.createInstance(command))
            // a plain routed Listing declaring interaction capabilities is bridged into the CRUD
            // engine BEFORE routing/dispatch, so it gets the mediator with only its declared routes
            .map(
                instance ->
                    io.mateu.core.infra.declarative.orchestrators.crud.CapabilityCrud
                        .bridgeIfNeeded(instance))
            .flatMap(instance -> routeIfNeeded(command, instance))
            .flatMapMany(
                instance ->
                    actionRunnerProvider
                        .get(
                            instance,
                            command.actionId(),
                            command.consumedRoute(),
                            command.route(),
                            command.httpRequest())
                        .run(instance, command)))
        .flatMap(result -> mapToUiIncrement(result, command))
        .doOnError(
            e -> {
              var notFound = missingOnLoad(e, command);
              if (notFound != null) {
                // not an application error: the route names something that is not there
                // one INFO line, like an access log 404: no state, no stack trace
                log.info("Not found: route {} — {}", command.route(), notFound.getMessage());
              }
              // anything else is logged by the ErrorBoundary, once, with its reference id
            })
        .onErrorResume(
            error -> {
              var forbidden =
                  io.mateu.core.application.security.MateuForbiddenException.find(error);
              if (forbidden != null) {
                // a refused request is not an application error to show: it answers 403
                return Mono.error(forbidden);
              }
              var notFound = missingOnLoad(error, command);
              if (notFound != null) {
                // the page that was asked for does not exist: a not-found page in its place
                return mapToUiIncrement(NotFoundPage.forMissing(notFound, command), command);
              }
              // the user sees a UserFacingException's / validation message, or a generic one with
              // a reference id the full error is logged under (never a raw exception message)
              return mapToUiIncrement(
                  ErrorBoundary.toMessage(error, command.actionId(), command.httpRequest()),
                  command);
            })
        .switchIfEmpty(
            Mono.defer(
                () ->
                    NotFoundPage.isLoad(command.actionId())
                        // a route that resolves to nothing: the same not-found page
                        ? mapToUiIncrement(NotFoundPage.forUnknownRoute(command), command)
                        : mapToUiIncrement(
                            Text.builder().text("Not found.").style("color: red;").build(),
                            command)));
  }

  /**
   * The {@link java.util.NoSuchElementException} behind a failed LOAD of a route — the record or
   * screen the route names does not exist — or null when the failure is anything else, or happened
   * running an action on a screen that does exist.
   */
  private static java.util.NoSuchElementException missingOnLoad(
      Throwable error, RunActionCommand command) {
    return NotFoundPage.isLoad(command.actionId()) ? NotFoundPage.find(error) : null;
  }

  // ── Bindable contract ─────────────────────────────────────────────────────
  // A reserved "action" that returns the ModelView's bindable contract (its fields + actions)
  // instead of running anything: the visual-builder tooling POSTs a normal sync request with the
  // ModelView as serverSideType and this actionId, and reads the contract off the response's
  // appData. Reuses the real mapping (so the contract can't drift) and rides the existing
  // transport,
  // so it needs no new endpoint on any adapter. The contract itself is computed by
  // ModelViewContractExtractor over the mapped component. Key in appData:
  public static final String CONTRACT_ACTION = "__contract__";
  public static final String CONTRACT_KEY = "_contract";

  private Flux<UIIncrementDto> handleContract(RunActionCommand command) {
    return Mono.just(command)
        .flatMap(ignored -> actionInstanceCreator.createInstance(command))
        .map(
            instance ->
                io.mateu.core.infra.declarative.orchestrators.crud.CapabilityCrud.bridgeIfNeeded(
                    instance))
        .flatMap(instance -> routeIfNeeded(command, instance))
        // Map the instance as a plain load (no action is run) so we get its component, then reduce
        // the response to just the extracted contract.
        .flatMap(instance -> mapToUiIncrement(instance, command))
        .map(RunActionUseCase::toContractResponse)
        .flux();
  }

  private static UIIncrementDto toContractResponse(UIIncrementDto increment) {
    return UIIncrementDto.builder()
        .appData(java.util.Map.of(CONTRACT_KEY, extractContract(increment)))
        .build();
  }

  private static ModelViewContractDto extractContract(UIIncrementDto increment) {
    if (increment.fragments() == null) {
      return new ModelViewContractDto(null, List.of(), List.of());
    }
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ServerSideComponentDto)
        .map(component -> ModelViewContractExtractor.extract((ServerSideComponentDto) component))
        .findFirst()
        .orElse(new ModelViewContractDto(null, List.of(), List.of()));
  }

  // ── Live preview ──────────────────────────────────────────────────────────
  // Renders arbitrary YAML page TEXT (the visual builder sends the editor's current, unsaved
  // content in parameters._yaml) into the same wire increment a real route would produce, so the
  // plugin's preview is faithful (real mapper) and updates as you type. The layout only — no
  // ModelView instance/data is bound (a layout preview).
  public static final String PREVIEW_ACTION = "__preview__";
  public static final String PREVIEW_YAML_KEY = "_yaml";

  private Flux<UIIncrementDto> handlePreview(RunActionCommand command) {
    var rq = command.httpRequest() != null ? command.httpRequest().runActionRq() : null;
    var parameters = rq != null ? rq.parameters() : null;
    var yaml =
        parameters != null ? String.valueOf(parameters.getOrDefault(PREVIEW_YAML_KEY, "")) : "";
    var component = yamlUidlLoader.parseText(yaml);
    if (component == null) {
      return mapToUiIncrement(
              Text.builder().text("Invalid or empty YAML").style("color: red;").build(), command)
          .flux();
    }
    return mapToUiIncrement(component, command).flux();
  }

  // ── Server-side proxy fetch ────────────────────────────────────────────────
  // PROXY mode of the external-REST features (@RestOptions/@RestListing/@RestAction/@RestData): the
  // browser posts this reserved action with the source's id/kind instead of fetching the endpoint
  // itself, and the SERVER does the fetch — resolving CORS (browser↔Mateu is same-origin) and
  // injecting ${secret.X} auth server-side (never on the client). The declared RestDataSource is
  // resolved from the annotation (RestSourceResolver), never from a client-supplied url. The raw
  // JSON body rides back on appData._restfetch; the renderer maps it exactly as in direct mode.
  public static final String RESTFETCH_ACTION = "__restfetch__";
  public static final String RESTFETCH_KEY = "_restfetch";
  // A proxied call that failed rides back here instead of on _restfetch, so the renderer shows the
  // error rather than treating an empty body as success. {status, message} — status 0 = transport.
  public static final String RESTFETCH_ERROR_KEY = "_restfetchError";

  private static final java.net.http.HttpClient REST_HTTP =
      java.net.http.HttpClient.newBuilder()
          .connectTimeout(java.time.Duration.ofSeconds(10))
          .build();
  private static final com.fasterxml.jackson.databind.ObjectMapper REST_MAPPER =
      new com.fasterxml.jackson.databind.ObjectMapper();

  private Flux<UIIncrementDto> handleRestFetch(RunActionCommand command) {
    return Mono.just(command)
        .flatMap(ignored -> actionInstanceCreator.createInstance(command))
        .map(
            instance ->
                io.mateu.core.infra.declarative.orchestrators.crud.CapabilityCrud.bridgeIfNeeded(
                    instance))
        .flatMap(instance -> routeIfNeeded(command, instance))
        // The upstream call is a BLOCKING java.net.http send (once per selected row on the bulk
        // path): it must not run on the reactive event-loop thread that serves every other request,
        // so the whole fetch moves to the bounded elastic pool, made for exactly this.
        .flatMap(
            instance ->
                Mono.fromCallable(() -> toRestFetchResponse(instance, command))
                    .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()))
        .flux();
  }

  private UIIncrementDto toRestFetchResponse(Object instance, RunActionCommand command) {
    var rq = command.httpRequest() != null ? command.httpRequest().runActionRq() : null;
    var params =
        rq != null && rq.parameters() != null
            ? rq.parameters()
            : java.util.Map.<String, Object>of();
    var kind = String.valueOf(params.getOrDefault("_sourceKind", ""));
    var id = String.valueOf(params.getOrDefault("_sourceId", ""));
    var source = RestSourceResolver.resolve(instance, kind, id, restSourceRegistry.catalog());
    if (source == null) {
      return UIIncrementDto.builder()
          .appData(java.util.Map.of(RESTFETCH_KEY, java.util.Map.of()))
          .build();
    }
    var state =
        command.componentState() != null
            ? command.componentState()
            : java.util.Map.<String, Object>of();
    // SAMPLE mode (opt-in only, see SampleSources): a source carrying sample data answers with it
    // instead of being called — the proxied twin of the browser's short-circuit in
    // fetchExternalJson, so both legs agree. A read gets the sample; a write (and a bulk one)
    // succeeds without persisting anything.
    if (SampleSources.enabled() && source.carriesSample()) {
      var method = source.method() == null ? "GET" : source.method().trim().toUpperCase();
      Object body = "GET".equals(method) || method.isEmpty() ? source.sample() : java.util.Map.of();
      return UIIncrementDto.builder().appData(java.util.Map.of(RESTFETCH_KEY, body)).build();
    }
    // Bulk (forEachSelectedRow): the loop runs on the SERVER, once per selected listing row, each
    // row merged OVER the component state so a per-id url like `.../people/${state.id}` resolves to
    // that row's id. Doing it here — rather than firing N calls from the browser — keeps the secret
    // server-side, needs a single round trip, and sidesteps the client's write-exclusivity guard
    // (which would otherwise drop all but the first of N identical `__restfetch__` actions).
    if (Boolean.parseBoolean(String.valueOf(params.get("_forEachSelectedRow")))) {
      var list =
          state.get("crud_selected_items") instanceof java.util.List<?> l ? l : java.util.List.of();
      int failed = 0;
      RestProxyException firstError = null;
      for (var row : list) {
        var rowState = new java.util.LinkedHashMap<String, Object>(state);
        if (row instanceof java.util.Map<?, ?> map) {
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
            failed + " of " + list.size() + " failed" + statusSuffix(firstError.status));
      }
      // The rows are gone; the client reloads the listing via successRoute, so no body is needed.
      return UIIncrementDto.builder()
          .appData(java.util.Map.of(RESTFETCH_KEY, java.util.Map.of()))
          .build();
    }
    try {
      return UIIncrementDto.builder()
          .appData(java.util.Map.of(RESTFETCH_KEY, performRestCall(source, state)))
          .build();
    } catch (RestProxyException e) {
      return restFetchError(e.status, "Request failed" + statusSuffix(e.status));
    }
  }

  /** A proxied REST call that failed: a >=400 upstream status, or a transport error (status 0). */
  private static final class RestProxyException extends RuntimeException {
    final int status;

    RestProxyException(int status, String message) {
      super(message);
      this.status = status;
    }
  }

  private static String statusSuffix(int status) {
    return status > 0 ? " (HTTP " + status + ")" : "";
  }

  private static UIIncrementDto restFetchError(int status, String message) {
    return UIIncrementDto.builder()
        .appData(
            java.util.Map.of(
                RESTFETCH_ERROR_KEY, java.util.Map.of("status", status, "message", message)))
        .build();
  }

  /**
   * One proxied REST call: interpolate the resolved source's url/headers/body against {@code state}
   * (with {@code ${secret.X}} resolved server-side) and send it, returning the parsed JSON
   * response. Throws {@link RestProxyException} on a >=400 status or a transport failure — the
   * caller decides how to surface it, rather than an empty body being mistaken for success. The
   * single unit both the single-fetch and bulk paths reuse.
   */
  private Object performRestCall(
      io.mateu.uidl.data.RestDataSource source, java.util.Map<String, Object> state) {
    java.util.function.Function<String, String> secrets = this::resolveSecret;
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
              .timeout(java.time.Duration.ofSeconds(60))
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
                ? (java.util.function.UnaryOperator<String>) TemplateInterpolator::jsonEscape
                : java.util.function.UnaryOperator.<String>identity();
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
        throw new RestProxyException(response.statusCode(), "HTTP " + response.statusCode());
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
      return java.util.Map.of();
    }
    return REST_MAPPER.readValue(body, Object.class);
  }

  /** The only environment variables a {@code ${secret.X}} may fall back to. */
  public static final String SECRET_ENV_PREFIX = "MATEU_SECRET_";

  /**
   * The environment variable {@code ${secret.KEY}} falls back to: {@code MATEU_SECRET_KEY} (a key
   * that already carries the prefix is used as is). Restricted on purpose: the fallback used to
   * read ANY variable of the process, so a template naming {@code ${secret.DB_PASSWORD}} (or a
   * cloud credential) would send it to whatever endpoint the source declared.
   */
  public static String secretEnvName(String key) {
    return key.startsWith(SECRET_ENV_PREFIX) ? key : SECRET_ENV_PREFIX + key;
  }

  /**
   * A {@code ${secret.X}} value: the first non-null SecretsProvider bean, else the environment
   * variable {@code MATEU_SECRET_X} (see {@link #secretEnvName}).
   */
  String resolveSecret(String key) {
    try {
      for (var p :
          io.mateu.uidl.di.MateuBeanProvider.getBeans(
              io.mateu.uidl.interfaces.SecretsProvider.class)) {
        var v = p.getSecret(key);
        if (v != null) {
          return v;
        }
      }
    } catch (Exception ignored) {
      // no provider registered (e.g. tests) — fall through to the environment
    }
    return System.getenv(secretEnvName(key));
  }

  private Mono<UIIncrementDto> mapToUiIncrement(Object result, RunActionCommand command) {
    return uiIncrementMapperProvider
        .get(result)
        .map(
            result,
            command.baseUrl(),
            command.route(),
            command.consumedRoute(),
            command.initiatorComponentId(),
            command.httpRequest())
        // Stamp each routed component with a structure hash (ETag) and, when the client echoed a
        // still-matching hash, omit the structure so only state/data travel (phase b of the client
        // structure cache). This is the single chokepoint every increment mapper flows through.
        .map(increment -> StructureHashPostProcessor.apply(increment, knownStructureHash(command)))
        .doOnNext(RunActionUseCase::recordEmittedTypes);
  }

  /**
   * Remembers the server-side types this response hands to the client, which will name them back on
   * its next request (see {@link io.mateu.core.application.security.WireTypePolicy}).
   */
  private static void recordEmittedTypes(UIIncrementDto increment) {
    if (increment == null || increment.fragments() == null) {
      return;
    }
    for (var fragment : increment.fragments()) {
      if (fragment != null) {
        recordEmittedTypes(fragment.component(), 0);
      }
    }
  }

  private static void recordEmittedTypes(io.mateu.dtos.ComponentDto component, int depth) {
    if (component == null || depth > 64) {
      return;
    }
    if (component instanceof ServerSideComponentDto serverSide) {
      io.mateu.core.application.security.WireTypes.emitted(serverSide.serverSideType());
    }
    if (component.children() != null) {
      for (var child : component.children()) {
        recordEmittedTypes(child, depth + 1);
      }
    }
  }

  private static String knownStructureHash(RunActionCommand command) {
    var rq = command.httpRequest() != null ? command.httpRequest().runActionRq() : null;
    return rq != null ? rq.knownStructureHash() : null;
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if (instance instanceof Mono<?> mono) {
      // flatMap, not map: routeIfNeeded answers a Mono, and map would emit that Mono itself as the
      // "instance" — the action would then run against a MonoJust instead of the view model.
      return mono.flatMap(i -> routeIfNeeded(command, i));
    }
    if (instance instanceof RouteHandler handlesRoute) {
      return Mono.just(handlesRoute.handleRoute(command.route(), command.httpRequest()));
    }
    if (instance instanceof ReactiveRouteHandler handlesRoute) {
      return handlesRoute.handleRoute(command.route(), command.httpRequest());
    }
    return Mono.just(instance);
  }
}
