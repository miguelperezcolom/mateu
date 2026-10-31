package io.mateu.core.application.microfrontends;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.out.MateuHttpClient;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FragmentCacheDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.CorrelationIdProvider;
import io.mateu.uidl.remote.FragmentCachePolicy;
import io.mateu.uidl.remote.FragmentCacheStore;
import io.mateu.uidl.remote.MicroFrontendResolutionEvent;
import io.mateu.uidl.remote.MicroFrontendResolutionEvent.Outcome;
import io.mateu.uidl.remote.MicroFrontendResolutionListener;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.remote.RemoteRegistry;
import io.mateu.uidl.security.CallerIdentity;
import java.time.Duration;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.function.Function;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Resolves, while the host builds a response, the micro frontends declared {@code resolve = SERVER}
 * (and the content slots): asks their remotes in parallel, on the user's behalf, within the view's
 * time budget, and embeds what arrives in time. What does not — slow, failing, down — goes out as
 * it would have with {@code resolve = CLIENT} (the renderer asks), or as its fallback for a content
 * slot. So it never makes a screen worse than resolving in the client.
 *
 * <ol>
 *   <li>each one must be under a registered remote ({@link RemoteRegistry}): if not, that is a
 *       configuration error, the response fails and nothing is asked (no server-side request
 *       forgery from a UI definition);
 *   <li>the budget is the largest timeout among them, capped by {@code
 *       mateu.microfrontends.max-budget-ms}; each waits its own timeout within it, and the calls
 *       still running at their deadline are cancelled;
 *   <li>each call carries the caller's identity as its remote's {@code RemoteIdentityStrategy}
 *       says, and the correlation id ({@value DefaultCorrelationIdProvider#HEADER});
 *   <li>a remote may declare its answer cacheable ({@link FragmentCachePolicy}); the host obeys;
 *   <li>every fragment leaves a trace (logger {@code io.mateu.microfrontends}) and is told to the
 *       {@link MicroFrontendResolutionListener}s.
 * </ol>
 *
 * Resolving is not absorbing: the embedded answer keeps the micro frontend's base url, route and
 * type, and the renderer sends everything after the first paint to the remote. The host never
 * proxies the interaction.
 */
public final class MicroFrontendServerResolver {

  /** The header carrying the keys of a url the host holds (see {@link FragmentCachePolicy#KEY}). */
  public static final String FRAGMENT_KEYS_HEADER = "X-Mateu-Fragment-Keys";

  private static final Logger TRACE = LoggerFactory.getLogger("io.mateu.microfrontends");
  private static final int MAX_KNOWN_KEYS = 16;

  private final RemoteRegistry registry;
  private final MateuHttpClient http;
  private final FragmentCacheStore cache;
  private final RemoteIdentityStrategies identities;
  private final CorrelationIdProvider correlation;
  private final List<MicroFrontendResolutionListener> listeners;
  private final MicroFrontendSettings settings;
  private final Function<HttpRequest, CallerIdentity> callers;
  private final Function<HttpRequest, String> selfBaseUrl;
  private final ObjectMapper wire;

  public MicroFrontendServerResolver(
      RemoteRegistry registry,
      MateuHttpClient http,
      FragmentCacheStore cache,
      RemoteIdentityStrategies identities,
      CorrelationIdProvider correlation,
      List<MicroFrontendResolutionListener> listeners,
      MicroFrontendSettings settings,
      Function<HttpRequest, CallerIdentity> callers,
      Function<HttpRequest, String> selfBaseUrl,
      ObjectMapper wire) {
    this.registry = registry;
    this.http = http;
    this.cache = cache;
    this.identities = identities;
    this.correlation = correlation;
    this.listeners = List.copyOf(listeners);
    this.settings = settings;
    this.callers = callers;
    this.selfBaseUrl = selfBaseUrl;
    this.wire = wire;
  }

  /**
   * Whether a request's response may carry something to resolve — set by the mappers that emit one,
   * so a response without any costs no walk.
   */
  public static boolean pending(HttpRequest request) {
    return request != null
        && Boolean.TRUE.equals(
            request.getAttribute(
                io.mateu.core.domain.out.fragmentmapper.mappers.MicroFrontendMapper.PENDING));
  }

  /** The increment with its server-resolved micro frontends resolved, embedded or degraded. */
  public Mono<UIIncrementDto> resolve(UIIncrementDto increment, HttpRequest request) {
    if (increment == null) {
      return Mono.empty();
    }
    var found = MicroFrontendTree.collect(increment);
    if (found.isEmpty()) {
      return Mono.just(increment);
    }
    return Mono.defer(
        () -> {
          // planned up front: a configuration error fails the response before anything is asked
          var plans = new ArrayList<Plan>();
          for (var each : found) {
            plans.add(plan(each, request));
          }
          var budget =
              Math.min(
                  plans.stream().mapToInt(Plan::timeoutMs).max().orElse(0), settings.maxBudgetMs());
          var correlationId = correlation.correlationId(request);
          var caller = callers.apply(request);
          return Flux.fromIterable(plans)
              .flatMap(
                  plan ->
                      fetch(
                              plan,
                              Math.min(plan.timeoutMs(), budget),
                              request,
                              correlationId,
                              caller)
                          .map(replacement -> Map.entry(plan.found().host(), replacement)),
                  Math.max(1, plans.size()))
              .collectList()
              .map(
                  replacements -> {
                    var byHost = new IdentityHashMap<ClientSideComponentDto, ComponentDto>();
                    replacements.forEach(entry -> byHost.put(entry.getKey(), entry.getValue()));
                    return MicroFrontendTree.rewrite(increment, byHost);
                  });
        });
  }

  /** What resolving one micro frontend takes. */
  private record Plan(
      MicroFrontendTree.Found found,
      MicroFrontendDto microFrontend,
      RemoteDescriptor remote,
      String callBaseUrl,
      int timeoutMs,
      String slotKey,
      ComponentDto fallback,
      boolean degradeToClient,
      String problem) {}

  private Plan plan(MicroFrontendTree.Found found, HttpRequest request) {
    var microFrontend = found.microFrontend();
    var server = microFrontend.server();
    if (server.slotKey() != null) {
      // a content slot: the content remote, at the route its key names
      server =
          new io.mateu.dtos.ServerResolutionDto(
              server.timeoutMs(),
              server.remoteId() != null ? server.remoteId() : settings.contentRemoteId(),
              server.slotKey(),
              server.fallback(),
              server.degradeToClient());
      microFrontend =
          new MicroFrontendDto(
              microFrontend.baseUrl(),
              microFrontend.route() != null
                  ? microFrontend.route()
                  : settings.contentRouteFor(server.slotKey()),
              microFrontend.consumedRoute(),
              microFrontend.style(),
              microFrontend.cssClasses(),
              microFrontend.serverSideType(),
              microFrontend.appState(),
              microFrontend.actionId(),
              null,
              server);
    }
    RemoteDescriptor remote;
    if (server.remoteId() != null) {
      remote = registry.byId(server.remoteId()).orElse(null);
      if (remote != null) {
        // a slot names its remote: the url is built from it, the developer never writes it
        microFrontend =
            new MicroFrontendDto(
                remote.baseUrl(),
                microFrontend.route(),
                microFrontend.consumedRoute(),
                microFrontend.style(),
                microFrontend.cssClasses(),
                microFrontend.serverSideType(),
                microFrontend.appState(),
                microFrontend.actionId(),
                null,
                server);
      }
    } else {
      remote = registry.forUrl(microFrontend.baseUrl()).orElse(null);
    }
    String problem = null;
    String callBaseUrl = null;
    if (remote == null) {
      problem =
          server.remoteId() != null
              ? "no remote is registered as '" + server.remoteId() + "'"
              : microFrontend.baseUrl() + " is not under any registered remote (mateu.remotes)";
    } else {
      callBaseUrl = absolute(microFrontend.baseUrl(), request);
      if (callBaseUrl == null) {
        problem =
            "its base url "
                + microFrontend.baseUrl()
                + " is a path on this server and this server does not know its own base url: set"
                + " mateu.self-base-url";
      }
    }
    if (problem != null && server.slotKey() == null) {
      // a plain micro frontend that the host may not ask: a configuration error, never degraded
      // (a content slot paints its fallback instead: it never brings the screen down)
      throw new IllegalStateException(
          "Micro frontend " + describe(microFrontend) + " is resolve = SERVER but " + problem);
    }
    if (remote != null) {
      // an unknown identity strategy is a configuration error too — before anything is asked
      identities.of(remote);
    }
    var timeout =
        positive(server.timeoutMs()) != null
            ? server.timeoutMs()
            : remote != null && positive(remote.timeoutMs()) != null
                ? remote.timeoutMs()
                : settings.defaultTimeoutMs();
    return new Plan(
        found,
        microFrontend,
        remote,
        callBaseUrl,
        timeout,
        server.slotKey(),
        server.fallback(),
        server.degradeToClient(),
        problem);
  }

  private Mono<ComponentDto> fetch(
      Plan plan, int timeoutMs, HttpRequest request, String correlationId, CallerIdentity caller) {
    var started = System.nanoTime();
    if (plan.problem() != null) {
      // only a content slot gets here: its remote is not configured, the screen does not fail —
      // and with no remote to point at, the renderer could not ask it either
      return Mono.just(fallback(plan, started, Outcome.ERROR, correlationId, plan.problem()));
    }
    var microFrontend = plan.microFrontend();
    var url = urlOf(plan);
    var strategy = identities.of(plan.remote());
    return Mono.fromCallable(() -> strategy.headers(plan.remote(), request))
        // a strategy may block (a token exchange): never on the request thread
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(
            identityHeaders -> {
              var authorization = authorizationOf(identityHeaders);
              var callerKey = FragmentCacheKeys.caller(caller, authorization);
              var cached = cached(url, callerKey);
              if (cached != null) {
                return Mono.just(new Answer(cached, Outcome.FROM_CACHE));
              }
              var headers = new LinkedHashMap<String, String>(identityHeaders);
              headers.put(DefaultCorrelationIdProvider.HEADER, correlationId);
              var known = cache.get(FragmentCacheKeys.known(url));
              if (known != null && !known.isBlank()) {
                headers.put(FRAGMENT_KEYS_HEADER, known);
              }
              var call = requestFor(microFrontend);
              // a supplier: cancelling the Mono (the deadline) cancels the call itself
              return Mono.fromFuture(() -> http.sendWithHeaders(plan.callBaseUrl(), call, headers))
                  .map(answer -> received(url, callerKey, answer));
            })
        .timeout(Duration.ofMillis(timeoutMs))
        .map(
            answer -> {
              if (answer.outcome() == Outcome.ERROR) {
                return degrade(plan, started, Outcome.ERROR, correlationId, answer.error());
              }
              if (plan.slotKey() != null && isEmpty(answer.increment())) {
                return degrade(plan, started, Outcome.EMPTY, correlationId, null);
              }
              trace(plan, started, answer.outcome(), null, correlationId, null);
              return (ComponentDto)
                  plan.found()
                      .host()
                      .withMetadata(microFrontend.embedding(embeddable(answer.increment())));
            })
        .onErrorResume(
            error ->
                Mono.just(
                    error instanceof TimeoutException
                        ? degrade(plan, started, Outcome.TIMEOUT, correlationId, null)
                        : degrade(plan, started, Outcome.ERROR, correlationId, messageOf(error))));
  }

  private record Answer(UIIncrementDto increment, Outcome outcome, String error) {
    Answer(UIIncrementDto increment, Outcome outcome) {
      this(increment, outcome, null);
    }
  }

  /** What the host had for this url and caller, when the remote allowed it. */
  private UIIncrementDto cached(String url, String callerKey) {
    var rule = cache.get(FragmentCacheKeys.rule(url));
    if (rule == null) {
      return null;
    }
    String key = null;
    if (FragmentCachePolicy.KEY.equals(rule)) {
      key = cache.get(FragmentCacheKeys.memo(url, callerKey));
      if (key == null) {
        return null;
      }
    }
    var varying = FragmentCacheKeys.varying(rule, callerKey, key);
    return varying == null ? null : read(cache.get(FragmentCacheKeys.entry(url, varying)));
  }

  /** What the remote answered, remembered as it allowed. */
  private Answer received(String url, String callerKey, UIIncrementDto answer) {
    var policy = answer.fragmentCache();
    if (policy != null && policy.notModified()) {
      // "use yours": the host offered this key, the entry must still be there
      var mine =
          policy.key() == null
              ? null
              : read(cache.get(FragmentCacheKeys.entry(url, "key:" + policy.key())));
      if (mine == null) {
        return new Answer(null, Outcome.ERROR, "remote answered not-modified for a key not held");
      }
      remember(url, callerKey, policy, null);
      return new Answer(mine, Outcome.FROM_CACHE);
    }
    var embeddable = embeddable(answer);
    if (FragmentCacheKeys.cacheable(policy)) {
      remember(url, callerKey, policy, embeddable);
    }
    return new Answer(embeddable, Outcome.EMBEDDED);
  }

  private void remember(
      String url, String callerKey, FragmentCacheDto policy, UIIncrementDto fragment) {
    var ttl = Duration.ofSeconds(policy.maxAgeSeconds());
    var vary = FragmentCacheKeys.normalised(policy.varyBy());
    cache.put(FragmentCacheKeys.rule(url), vary, ttl);
    if (FragmentCachePolicy.KEY.equals(vary)) {
      cache.put(FragmentCacheKeys.memo(url, callerKey), policy.key(), ttl);
      var known = new LinkedHashSet<String>();
      known.add(policy.key());
      var before = cache.get(FragmentCacheKeys.known(url));
      if (before != null) {
        for (var key : before.split(",")) {
          if (!key.isBlank() && known.size() < MAX_KNOWN_KEYS) known.add(key.trim());
        }
      }
      cache.put(FragmentCacheKeys.known(url), String.join(",", known), ttl);
    }
    if (fragment != null) {
      var varying = FragmentCacheKeys.varying(vary, callerKey, policy.key());
      if (varying != null) {
        cache.put(FragmentCacheKeys.entry(url, varying), write(fragment), ttl);
      }
    }
  }

  /** The remote's answer as embedded: its fragments, nothing that would act on the HOST's page. */
  private static UIIncrementDto embeddable(UIIncrementDto answer) {
    if (answer == null) {
      return null;
    }
    // commands (a window title, a navigation), messages, banners and the app state/data belong to
    // a page and an app, and both are the host's: only what paints the island travels
    return new UIIncrementDto(
        List.of(),
        List.of(),
        answer.fragments(),
        List.of(),
        false,
        null,
        null,
        answer.wireVersion(),
        answer.restSources(),
        null);
  }

  private static boolean isEmpty(UIIncrementDto increment) {
    return increment == null
        || increment.fragments().stream().noneMatch(fragment -> fragment.component() != null);
  }

  private ComponentDto degrade(
      Plan plan, long started, Outcome outcome, String correlationId, String error) {
    if (plan.degradeToClient()) {
      trace(plan, started, outcome, "client", correlationId, error);
      return plan.found().host().withMetadata(plan.microFrontend().forClient());
    }
    return fallback(plan, started, outcome, correlationId, error);
  }

  private ComponentDto fallback(
      Plan plan, long started, Outcome outcome, String correlationId, String error) {
    if (plan.fallback() != null) {
      trace(plan, started, outcome, "fallback", correlationId, error);
      return plan.fallback();
    }
    trace(plan, started, outcome, "nothing", correlationId, error);
    return MicroFrontendTree.REMOVE;
  }

  private void trace(
      Plan plan,
      long started,
      Outcome outcome,
      String degradedTo,
      String correlationId,
      String error) {
    var event =
        new MicroFrontendResolutionEvent(
            plan.remote() != null ? plan.remote().id() : null,
            plan.callBaseUrl() != null ? urlOf(plan) : describe(plan.microFrontend()),
            plan.slotKey(),
            (System.nanoTime() - started) / 1_000_000,
            outcome,
            degradedTo,
            correlationId,
            error);
    if (outcome == Outcome.ERROR) {
      TRACE.warn(
          "micro frontend remote={} url={} slot={} outcome={} degradedTo={} ms={} correlationId={}"
              + " error={}",
          event.remoteId(),
          event.url(),
          event.slotKey(),
          event.outcome(),
          event.degradedTo(),
          event.durationMillis(),
          event.correlationId(),
          event.error());
    } else {
      TRACE.info(
          "micro frontend remote={} url={} slot={} outcome={} degradedTo={} ms={} correlationId={}",
          event.remoteId(),
          event.url(),
          event.slotKey(),
          event.outcome(),
          event.degradedTo(),
          event.durationMillis(),
          event.correlationId());
    }
    for (var listener : listeners) {
      try {
        listener.onResolution(event);
      } catch (RuntimeException e) {
        TRACE.warn("A MicroFrontendResolutionListener failed: {}", e.toString());
      }
    }
  }

  /** The load the host sends to the remote AS the island the renderer will host it in. */
  private static RunActionRqDto requestFor(MicroFrontendDto microFrontend) {
    return RunActionRqDto.builder()
        .actionId(microFrontend.actionId() != null ? microFrontend.actionId() : "")
        .route(microFrontend.route() != null ? microFrontend.route() : "")
        .consumedRoute(microFrontend.consumedRoute())
        .serverSideType(microFrontend.serverSideType())
        .appState(mapOf(microFrontend.appState()))
        .componentState(Map.of())
        .initiatorComponentId(MicroFrontendIds.of(microFrontend))
        .build();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> mapOf(Object value) {
    if (value instanceof Map<?, ?> map) {
      var out = new LinkedHashMap<String, Object>();
      map.forEach((k, v) -> out.put(String.valueOf(k), v));
      return out;
    }
    return Map.of();
  }

  /** What identifies the fragment for caching: everything the load sends. */
  private String urlOf(Plan plan) {
    var microFrontend = plan.microFrontend();
    var base = plan.callBaseUrl() != null ? plan.callBaseUrl() : microFrontend.baseUrl();
    var route = microFrontend.route() == null ? "" : microFrontend.route();
    return base.replaceAll("/+$", "")
        + (route.startsWith("/") || route.isEmpty() ? route : "/" + route)
        + suffixOf(microFrontend);
  }

  private String suffixOf(MicroFrontendDto microFrontend) {
    var parts = new ArrayList<String>();
    if (microFrontend.serverSideType() != null) parts.add("type=" + microFrontend.serverSideType());
    if (microFrontend.consumedRoute() != null)
      parts.add("consumed=" + microFrontend.consumedRoute());
    if (microFrontend.actionId() != null && !microFrontend.actionId().isBlank()) {
      parts.add("action=" + microFrontend.actionId());
    }
    if (microFrontend.appState() != null) parts.add("appState=" + write(microFrontend.appState()));
    return parts.isEmpty() ? "" : "#" + String.join("&", parts);
  }

  private String absolute(String baseUrl, HttpRequest request) {
    if (baseUrl == null) {
      return null;
    }
    if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) {
      return baseUrl;
    }
    var self = selfBaseUrl.apply(request);
    if (self == null) {
      return null;
    }
    var origin = self.replaceAll("/+$", "");
    return origin + (baseUrl.startsWith("/") ? baseUrl : "/" + baseUrl);
  }

  private static String authorizationOf(Map<String, String> headers) {
    for (var entry : headers.entrySet()) {
      if ("authorization".equalsIgnoreCase(entry.getKey())) {
        return entry.getValue();
      }
    }
    return null;
  }

  private static Integer positive(Integer value) {
    return value != null && value > 0 ? value : null;
  }

  private static String describe(MicroFrontendDto microFrontend) {
    return (microFrontend.baseUrl() == null ? "" : microFrontend.baseUrl())
        + (microFrontend.route() == null ? "" : microFrontend.route());
  }

  private static String messageOf(Throwable error) {
    var cause = error;
    while (cause.getCause() != null && cause.getCause() != cause) {
      cause = cause.getCause();
    }
    return cause.getClass().getSimpleName()
        + (cause.getMessage() != null ? ": " + cause.getMessage() : "");
  }

  private String write(Object value) {
    try {
      return wire.writeValueAsString(value);
    } catch (Exception e) {
      return String.valueOf(value);
    }
  }

  private UIIncrementDto read(String json) {
    if (json == null) {
      return null;
    }
    try {
      return wire.readValue(json, UIIncrementDto.class);
    } catch (Exception e) {
      return null;
    }
  }
}
