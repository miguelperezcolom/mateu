package io.mateu.core.application.runaction;

import io.mateu.core.application.contract.ModelViewContractExtractor;
import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.infra.StructureHashPostProcessor;
import io.mateu.core.infra.TemplateInterpolator;
import io.mateu.dtos.ModelViewContractDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveRouteHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.lang.reflect.InvocationTargetException;
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

  public Flux<UIIncrementDto> handle(RunActionCommand command) {
    log.info("run action {}", command.actionId());
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
        .doOnError(e -> log.error("Error handling action {}", command.actionId(), e))
        .onErrorResume(
            error ->
                mapToUiIncrement(
                    Message.builder()
                        .variant(NotificationVariant.error)
                        .title(extractTitle(error))
                        .text(extractText(error))
                        .build(),
                    command))
        .switchIfEmpty(
            mapToUiIncrement(
                Text.builder().text("Not found.").style("color: red;").build(), command));
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
        .map(instance -> toRestFetchResponse(instance, command))
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
    var url = TemplateInterpolator.interpolate(source.url(), state, secrets);
    var method =
        source.method() == null || source.method().isBlank()
            ? "GET"
            : source.method().toUpperCase();
    try {
      var builder =
          java.net.http.HttpRequest.newBuilder()
              .uri(java.net.URI.create(url))
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
      return REST_MAPPER.readValue(response.body(), Object.class);
    } catch (RestProxyException e) {
      log.warn("proxy rest fetch failed: {} url={} method={}", e.getMessage(), url, method);
      throw e;
    } catch (Exception e) {
      log.warn("proxy rest fetch failed: {} url={} method={}", e.getMessage(), url, method);
      throw new RestProxyException(0, e.getMessage());
    }
  }

  /** A {@code ${secret.X}} value: the first non-null SecretsProvider bean, else the environment. */
  private String resolveSecret(String key) {
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
    return System.getenv(key);
  }

  private String extractTitle(Throwable e) {
    return getSourceException(e).getClass().getSimpleName();
  }

  private Throwable getSourceException(Throwable e) {
    if (e instanceof InvocationTargetException ite) {
      return ite.getTargetException();
    }
    if (e.getCause() != null) {
      return e.getCause();
    }
    return e;
  }

  private String extractText(Throwable e) {
    var sourceException = getSourceException(e);
    if (sourceException.getMessage() != null) {
      return sourceException.getMessage();
    }
    return sourceException.getClass().getSimpleName();
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
        .map(increment -> StructureHashPostProcessor.apply(increment, knownStructureHash(command)));
  }

  private static String knownStructureHash(RunActionCommand command) {
    var rq = command.httpRequest() != null ? command.httpRequest().runActionRq() : null;
    return rq != null ? rq.knownStructureHash() : null;
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  private static Mono<?> routeIfNeeded(RunActionCommand command, Object instance) {
    if (instance instanceof Mono<?> mono) {
      return mono.map(i -> routeIfNeeded(command, i));
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
