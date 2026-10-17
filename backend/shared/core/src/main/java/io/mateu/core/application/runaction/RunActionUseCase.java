package io.mateu.core.application.runaction;

import io.mateu.core.application.contract.ModelViewContractExtractor;
import io.mateu.core.domain.act.ActionRunnerProvider;
import io.mateu.core.domain.out.UiIncrementMapperProvider;
import io.mateu.core.infra.StructureHashPostProcessor;
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
      // a route that repeats the mount it was sent to (/e2-demo/page to /e2-demo) is the same
      // place as the relative one (/page): read it as such, or the app answers for its own content
      // and the shell reloads forever (see MountPrefixedRoutes)
      var relative = MountPrefixedRoutes.relativize(incoming);
      command = yamlUidlLoader != null ? yamlUidlLoader.guard(relative) : relative;
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
    if (APP_SOURCE_ACTION.equals(command.actionId())) {
      return handleAppSource(command);
    }
    return (resolveInstance(command)
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
                        ? mapToUiIncrement(
                            NotFoundPage.forUnknownRoute(
                                command,
                                yamlUidlLoader != null ? yamlUidlLoader.specProblems() : null),
                            command)
                        : mapToUiIncrement(
                            Text.builder().text("Not found.").style("color: red;").build(),
                            command)));
  }

  /**
   * The instance the request is addressed to, as every path sees it: created for the route, checked
   * against its class-level {@code @EyesOnly}, bridged into the CRUD engine when it is a plain
   * routed Listing declaring interaction capabilities (BEFORE routing/dispatch, so it gets the
   * mediator with only its declared routes), routed when it handles routes itself, and checked
   * again on what a route handler handed over.
   */
  private Mono<?> resolveInstance(RunActionCommand command) {
    return Mono.just(command)
        .flatMap(ignored -> actionInstanceCreator.createInstance(command))
        .map(instance -> enforceClassLevelAccess(instance, command))
        .map(
            instance ->
                io.mateu.core.infra.declarative.orchestrators.crud.CapabilityCrud.bridgeIfNeeded(
                    instance, command.componentState()))
        .flatMap(instance -> routeIfNeeded(command, instance))
        .map(instance -> enforceClassLevelAccess(instance, command));
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
    return resolveInstance(command)
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

  private Flux<UIIncrementDto> handleRestFetch(RunActionCommand command) {
    return resolveInstance(command)
        // The upstream call is a BLOCKING java.net.http send (once per selected row on the bulk
        // path): it must not run on the reactive event-loop thread that serves every other request,
        // so the whole fetch moves to the bounded elastic pool, made for exactly this.
        .flatMap(
            instance ->
                Mono.fromCallable(() -> restProxy().fetch(instance, command))
                    .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()))
        .flux();
  }

  // ── App-shell sources through the server ───────────────────────────────────
  // A data-authored shell (type: AppShell) feeds its context pickers, notification inbox and
  // palette search from REST sources. A DIRECT source is fetched by the browser (served and static
  // alike); a PROXIED one comes here: the browser names the ROLE (and the picker's field), never a
  // url — the source is the one the SHELL declares, resolved against the catalogue the server
  // holds, so this can no more be turned into an open relay than __restfetch__ can.
  public static final String APP_SOURCE_ACTION = "_appsource";

  private Flux<UIIncrementDto> handleAppSource(RunActionCommand command) {
    // The shell and its source are resolved HERE, on the request's thread (its class loader is the
    // one the specs are read with); only the blocking upstream call moves to the elastic pool.
    java.util.concurrent.Callable<UIIncrementDto> call;
    try {
      call = restProxy().appSourceCall(command);
    } catch (RuntimeException e) {
      return Flux.error(e);
    }
    return Mono.fromCallable(call)
        .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic())
        .flux();
  }

  private volatile RestProxyCalls restProxy;

  /** The proxied REST calls, sharing this use case's catalogue, shell resolution and secrets. */
  private RestProxyCalls restProxy() {
    var proxy = restProxy;
    if (proxy == null) {
      proxy = new RestProxyCalls(restSourceRegistry, actionInstanceCreator, this::resolveSecret);
      restProxy = proxy;
    }
    return proxy;
  }

  /** What a proxied response's body becomes (see {@link RestProxyCalls#parseBody}). */
  static Object parseBody(String body) throws java.io.IOException {
    return RestProxyCalls.parseBody(body);
  }

  /**
   * The only environment variables a {@code ${secret.X}} may fall back to.
   *
   * @deprecated use {@link SecretResolver#SECRET_ENV_PREFIX}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static final String SECRET_ENV_PREFIX = SecretResolver.SECRET_ENV_PREFIX;

  /**
   * The environment variable {@code ${secret.KEY}} falls back to.
   *
   * @deprecated use {@link SecretResolver#secretEnvName(String)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static String secretEnvName(String key) {
    return SecretResolver.secretEnvName(key);
  }

  /** A {@code ${secret.X}} value (see {@link SecretResolver#resolve(String)}). */
  String resolveSecret(String key) {
    return SecretResolver.resolve(key);
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
        // The catalogue entries the response names by ref, BEFORE the structure may be omitted: a
        // page with no app shell receives no AppDto, and so no catalogue, any other way.
        .map(io.mateu.core.domain.out.fragmentmapper.mappers.ReferencedRestSources::apply)
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

  /**
   * A class-level {@code @EyesOnly} on the view the request resolved to must hold on EVERY request,
   * including the first load of a route — where the client names no {@code serverSideType} yet, so
   * {@link io.mateu.core.application.security.WireTypePolicy#check} has nothing to refuse. Without
   * this a restricted screen was only hidden from the menu: typing its URL rendered it. Checked on
   * the instance created for the route and again on what a {@code RouteHandler} hands over.
   */
  static Object enforceClassLevelAccess(Object instance, RunActionCommand command) {
    if (instance == null || instance instanceof Mono<?>) {
      return instance;
    }
    Class<?> type = instance.getClass();
    if (type.getName().contains("$$") && type.getSuperclass() != null) {
      type = type.getSuperclass(); // a container proxy: the annotations live on the user class
    }
    if (!io.mateu.core.application.security.WireTypePolicy.classLevelAccessGranted(
        type, command.httpRequest())) {
      log.warn(
          "Refused request: route '{}' resolved to @EyesOnly type '{}' and the caller's token does"
              + " not satisfy it",
          command.route(),
          type.getName());
      throw new io.mateu.core.application.security.MateuForbiddenException(
          "route not allowed for caller: " + command.route());
    }
    return instance;
  }

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
