package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.mateu.core.application.microfrontends.MicroFrontendSettings;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FragmentCacheDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.ContentSlot;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Resolve;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.remote.MicroFrontendResolutionEvent;
import io.mateu.uidl.remote.MicroFrontendResolutionEvent.Outcome;
import io.mateu.uidl.remote.MicroFrontendResolutionListener;
import io.mateu.uidl.remote.RemoteCatalogSupplier;
import io.mateu.uidl.remote.RemoteDescriptor;
import io.mateu.uidl.remote.RemoteIdentityStrategy;
import java.io.IOException;
import java.lang.reflect.RecordComponent;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The acceptance criteria of server-side micro frontend resolution and {@code @ContentSlot}
 * (docs/specs/microfrontend-server-resolution.md), against REAL remotes: a local HTTP server that
 * speaks the Mateu sync endpoint and plays a fast, a slow, a broken, an empty and several cacheable
 * remotes, recording every request it gets.
 */
class MicroFrontendServerResolutionSyncTest {

  static final ObjectMapper WIRE = WireMapper.shared();

  /**
   * The deadline of a remote that is expected to ANSWER: generous, so a loaded CI runner never
   * turns "answers in time" into a timeout (the .NET port's twin flaked that way on its cold first
   * call). The tests about deadlines use their own short ones (150 ms, a slot's 100 ms).
   */
  static final int IN_TIME = 5000;

  static HttpServer remote;
  static String base;
  static TestMateu mateu;
  static final List<Map<String, String>> REQUESTS = new CopyOnWriteArrayList<>();
  static final List<MicroFrontendResolutionEvent> EVENTS = new CopyOnWriteArrayList<>();
  static final Map<String, Integer> PATH_HITS = new ConcurrentHashMap<>();

  // ── the remotes ─────────────────────────────────────────────────────────────────────────────

  @BeforeAll
  static void startRemotesAndHost() throws IOException {
    remote = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    remote.setExecutor(Executors.newCachedThreadPool());
    remote.createContext("/", MicroFrontendServerResolutionSyncTest::answer);
    remote.start();
    base = "http://127.0.0.1:" + remote.getAddress().getPort();
    // the content service is registered as a path on this server (/_content-hub)
    System.setProperty("mateu.self-base-url", base);
    // the budget cap (2000 by default) would clip IN_TIME
    System.setProperty(MicroFrontendSettings.MAX_BUDGET, String.valueOf(2 * IN_TIME));
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new Remotes(), new ExchangeIdentity(), new Recorder()),
            ClientOnly.class,
            FastServer.class,
            SlowServer.class,
            BrokenServer.class,
            Unregistered.class,
            Parallel.class,
            CacheByKey.class,
            CachePerUser.class,
            CacheShared.class,
            CacheNone.class,
            Anonymous.class,
            Exchanged.class,
            SlotPage.class,
            DeadSlotPage.class);
    // warm up: the first resolution pays the cold start (JIT, Jackson's metadata, the first
    // connection); each test clears what it reads
    mateu.sync("/mfe-fast");
  }

  @AfterAll
  static void stop() {
    System.clearProperty("mateu.self-base-url");
    System.clearProperty(MicroFrontendSettings.MAX_BUDGET);
    mateu.close();
    remote.stop(0);
  }

  @BeforeEach
  void clear() {
    REQUESTS.clear();
    EVENTS.clear();
  }

  static void answer(HttpExchange exchange) throws IOException {
    var path = exchange.getRequestURI().getPath();
    var headers = new java.util.HashMap<String, String>();
    headers.put("path", path);
    for (var name : List.of("Authorization", "X-Mateu-Correlation-Id", "X-Mateu-Fragment-Keys")) {
      var value = exchange.getRequestHeaders().getFirst(name);
      if (value != null) headers.put(name, value);
    }
    REQUESTS.add(headers);
    var request = WIRE.readValue(exchange.getRequestBody(), RunActionRqDto.class);
    var remoteName = path.substring(1, path.indexOf('/', 1));
    PATH_HITS.merge(remoteName, 1, Integer::sum);
    try {
      switch (remoteName) {
        case "slow" -> Thread.sleep(3000);
        case "delayed" -> Thread.sleep(400);
        case "broken" -> {
          reply(exchange, 500, "boom");
          return;
        }
        default -> {}
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    FragmentCacheDto policy = null;
    String text = "hello from " + remoteName;
    switch (remoteName) {
      case "cachekey" -> {
        var auth = String.valueOf(headers.get("Authorization"));
        var key = auth.contains("alice") || auth.contains("anna") ? "aud-A" : "aud-B";
        var held = headers.getOrDefault("X-Mateu-Fragment-Keys", "");
        if (List.of(held.split(",")).contains(key)) {
          reply(exchange, 200, json(increment(null, new FragmentCacheDto(60, "key", key, true))));
          return;
        }
        policy = new FragmentCacheDto(60, "key", key, false);
        text = "content for " + key;
      }
      case "cacheuser" -> policy = new FragmentCacheDto(60, "user", null, false);
      case "cacheshared" -> policy = new FragmentCacheDto(60, "shared", null, false);
      case "cachenone" -> policy = new FragmentCacheDto(60, "none", null, false);
      case "_content-hub" -> {
        if (path.contains("front-office.home.vacio")) {
          reply(exchange, 204, "");
          return;
        }
        if (path.endsWith("front-office.home.caido")) {
          reply(exchange, 503, "down");
          return;
        }
        if (path.endsWith("front-office.home.lento")) {
          try {
            Thread.sleep(3000);
          } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
          }
        }
        text = "slot " + path.substring(path.lastIndexOf('/') + 1);
      }
      default -> {}
    }
    var fragment =
        new UIFragmentDto(
            request.initiatorComponentId(),
            new ClientSideComponentDto(
                new TextDto(TextContainerDto.p, Map.of(), text), "t", List.of(), null, null, null),
            Map.of(),
            Map.of(),
            UIFragmentActionDto.Replace,
            null);
    reply(exchange, 200, json(increment(fragment, policy)));
  }

  static UIIncrementDto increment(UIFragmentDto fragment, FragmentCacheDto policy) {
    return new UIIncrementDto(
        List.of(),
        // a remote's message never reaches the host's page
        List.of(MessageDto.builder().text("remote toast").build()),
        fragment == null ? List.of() : List.of(fragment),
        List.of(),
        false,
        null,
        null,
        null,
        null,
        policy);
  }

  static String json(Object value) throws IOException {
    return WIRE.writeValueAsString(value);
  }

  static void reply(HttpExchange exchange, int status, String body) throws IOException {
    var bytes = body.getBytes(StandardCharsets.UTF_8);
    try {
      exchange.sendResponseHeaders(status, status == 204 ? -1 : bytes.length);
      if (status != 204) exchange.getResponseBody().write(bytes);
    } catch (IOException cancelled) {
      // the host gave up on it
    } finally {
      exchange.close();
    }
  }

  // ── host wiring: registry, identity, listener ─────────────────────────────────────────────

  public static class Remotes implements RemoteCatalogSupplier {
    @Override
    public List<RemoteDescriptor> remotes() {
      var all = new ArrayList<RemoteDescriptor>();
      for (var name :
          List.of(
              "fast",
              "slow",
              "broken",
              "delayed",
              "cachekey",
              "cacheuser",
              "cacheshared",
              "cachenone")) {
        all.add(new RemoteDescriptor(name, base + "/" + name, IN_TIME, null));
      }
      all.add(new RemoteDescriptor("anon", base + "/anon", IN_TIME, RemoteIdentityStrategy.NONE));
      all.add(new RemoteDescriptor("exchanged", base + "/exchanged", IN_TIME, "exchange"));
      // a path on this server, as content-hub is deployed
      all.add(new RemoteDescriptor("content", "/_content-hub", 1000, null));
      return all;
    }
  }

  /** A token exchange: the remote gets a token for ITS audience, not the user's own. */
  public static class ExchangeIdentity implements RemoteIdentityStrategy {
    @Override
    public String name() {
      return "exchange";
    }

    @Override
    public Map<String, String> headers(RemoteDescriptor remote, HttpRequest request) {
      return Map.of("Authorization", "Bearer exchanged-for-" + remote.id());
    }
  }

  public static class Recorder implements MicroFrontendResolutionListener {
    @Override
    public void onResolution(MicroFrontendResolutionEvent event) {
      EVENTS.add(event);
    }
  }

  // ── the screens ───────────────────────────────────────────────────────────────────────────

  static MicroFrontend mfe(String remote, Resolve resolve, Integer timeoutMs) {
    return MicroFrontend.builder()
        .baseUrl(base + "/" + remote)
        .route("/widget")
        .serverSideType("remote.Widget")
        .resolve(resolve)
        .timeoutMs(timeoutMs)
        .build();
  }

  abstract static class Page implements ComponentTreeSupplier {
    abstract List<Component> parts();

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(parts());
    }
  }

  @UI("/mfe-client")
  public static class ClientOnly extends Page {
    List<Component> parts() {
      return List.of(
          new MicroFrontend(base + "/fast", "/widget", null, null, null, "x", null, null));
    }
  }

  @UI("/mfe-fast")
  public static class FastServer extends Page {
    List<Component> parts() {
      return List.of(mfe("fast", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-slow")
  public static class SlowServer extends Page {
    List<Component> parts() {
      return List.of(mfe("slow", Resolve.SERVER, 150));
    }
  }

  @UI("/mfe-broken")
  public static class BrokenServer extends Page {
    List<Component> parts() {
      return List.of(mfe("broken", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-unregistered")
  public static class Unregistered extends Page {
    List<Component> parts() {
      return List.of(
          mfe("fast", Resolve.SERVER, IN_TIME),
          MicroFrontend.builder()
              .baseUrl("http://169.254.169.254/latest")
              .route("/meta-data")
              .resolve(Resolve.SERVER)
              .build());
    }
  }

  @UI("/mfe-parallel")
  public static class Parallel extends Page {
    List<Component> parts() {
      return List.of(
          mfe("delayed", Resolve.SERVER, 2000),
          MicroFrontend.builder()
              .baseUrl(base + "/delayed")
              .route("/second")
              .resolve(Resolve.SERVER)
              .timeoutMs(2000)
              .build(),
          MicroFrontend.builder()
              .baseUrl(base + "/delayed")
              .route("/third")
              .resolve(Resolve.SERVER)
              .timeoutMs(2000)
              .build());
    }
  }

  @UI("/mfe-cache-key")
  public static class CacheByKey extends Page {
    List<Component> parts() {
      return List.of(mfe("cachekey", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-cache-user")
  public static class CachePerUser extends Page {
    List<Component> parts() {
      return List.of(mfe("cacheuser", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-cache-shared")
  public static class CacheShared extends Page {
    List<Component> parts() {
      return List.of(mfe("cacheshared", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-cache-none")
  public static class CacheNone extends Page {
    List<Component> parts() {
      return List.of(mfe("cachenone", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-anon")
  public static class Anonymous extends Page {
    List<Component> parts() {
      return List.of(mfe("anon", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/mfe-exchanged")
  public static class Exchanged extends Page {
    List<Component> parts() {
      return List.of(mfe("exchanged", Resolve.SERVER, IN_TIME));
    }
  }

  @UI("/slot-page")
  public static class SlotPage {
    String name = "Front office";

    @ContentSlot(key = "front-office.home.destacado", fallback = "No news")
    String destacado;

    @ContentSlot(key = "front-office.home.vacio", fallback = "Nothing yet")
    String vacio;

    @ContentSlot(key = "front-office.home.vacio-sin-fallback")
    String vacioSinFallback;
  }

  @UI("/dead-slot-page")
  public static class DeadSlotPage {
    String name = "Front office";

    @ContentSlot(key = "front-office.home.caido", fallback = "Down fallback")
    String caido;

    @ContentSlot(key = "front-office.home.lento", fallback = "Slow fallback", timeoutMs = 100)
    String lento;
  }

  // ── helpers ───────────────────────────────────────────────────────────────────────────────

  static UIIncrementDto load(String route, Map<String, String> headers) {
    return mateu.run(RunActionRqDto.builder().route(route).actionId("").build(), headers);
  }

  static UIIncrementDto load(String route) {
    return load(route, Map.of("authorization", "Bearer alice"));
  }

  static <T> List<T> all(Object node, Class<T> type) {
    var found = new ArrayList<T>();
    walk(node, type, found, new IdentityHashMap<>());
    return found;
  }

  private static <T> void walk(
      Object node, Class<T> type, List<T> found, Map<Object, Boolean> visited) {
    if (node == null || node instanceof String || visited.put(node, true) != null) return;
    if (type.isInstance(node)) found.add(type.cast(node));
    if (node instanceof Collection<?> items) {
      items.forEach(i -> walk(i, type, found, visited));
      return;
    }
    if (node instanceof Map<?, ?> map) {
      map.values().forEach(v -> walk(v, type, found, visited));
      return;
    }
    if (!node.getClass().isRecord() || !node.getClass().getPackageName().startsWith("io.mateu"))
      return;
    for (RecordComponent component : node.getClass().getRecordComponents()) {
      try {
        walk(component.getAccessor().invoke(node), type, found, visited);
      } catch (ReflectiveOperationException ignored) {
      }
    }
  }

  static MicroFrontendDto onlyMicroFrontend(UIIncrementDto increment) {
    var found = all(increment.fragments(), MicroFrontendDto.class);
    assertThat(found).hasSize(1);
    return found.get(0);
  }

  static List<String> texts(Object node) {
    return all(node, TextDto.class).stream().map(TextDto::text).toList();
  }

  static long hits(String remoteName) {
    return REQUESTS.stream().filter(r -> r.get("path").startsWith("/" + remoteName + "/")).count();
  }

  // ── acceptance criteria ───────────────────────────────────────────────────────────────────

  @Test
  void aMicroFrontendWithoutResolveIsExactlyAsBefore() throws Exception {
    var increment = load("/mfe-client");
    var microFrontend = onlyMicroFrontend(increment);
    assertThat(microFrontend.resolved()).isNull();
    var json = WIRE.readTree(WIRE.writeValueAsString(microFrontend));
    var keys = new ArrayList<String>();
    json.fieldNames().forEachRemaining(keys::add);
    assertThat(keys)
        .containsExactlyInAnyOrder(
            "type",
            "baseUrl",
            "route",
            "consumedRoute",
            "style",
            "cssClasses",
            "serverSideType",
            "appState",
            "actionId");
    assertThat(REQUESTS).as("the host asks nobody").isEmpty();
  }

  @Test
  void aServerMicroFrontendThatAnswersInTimeIsEmbeddedKeepingItsOrigin() {
    var increment = load("/mfe-fast");
    var microFrontend = onlyMicroFrontend(increment);
    assertThat(microFrontend.resolved()).isNotNull();
    assertThat(texts(microFrontend.resolved())).containsExactly("hello from fast");
    // resolving is not absorbing: the island still points at the remote
    assertThat(microFrontend.baseUrl()).isEqualTo(base + "/fast");
    assertThat(microFrontend.route()).isEqualTo("/widget");
    assertThat(microFrontend.serverSideType()).isEqualTo("remote.Widget");
    // its fragments target the island the renderer hosts it in
    assertThat(microFrontend.resolved().fragments().get(0).targetComponentId())
        .isEqualTo(
            "mfe_" + (base + "/fast|/widget||remote.Widget").replaceAll("[^a-zA-Z0-9]", "_"));
    // what acts on a page stays out: the page is the host's
    assertThat(microFrontend.resolved().messages()).isEmpty();
    assertThat(increment.messages()).isEmpty();
    assertThat(hits("fast")).isEqualTo(1);
    assertThat(EVENTS)
        .extracting(MicroFrontendResolutionEvent::outcome)
        .containsExactly(Outcome.EMBEDDED);
  }

  @Test
  void aSlowRemoteDegradesToTheClientAtItsDeadlineAndIsNotWaitedFor() {
    var started = System.nanoTime();
    var increment = load("/mfe-slow");
    var elapsedMs = (System.nanoTime() - started) / 1_000_000;
    var microFrontend = onlyMicroFrontend(increment);
    assertThat(microFrontend.resolved()).isNull();
    assertThat(microFrontend.server()).isNull();
    assertThat(microFrontend.baseUrl()).isEqualTo(base + "/slow");
    assertThat(elapsedMs).as("the remote takes 3 s, the budget is 150 ms").isLessThan(1500);
    assertThat(EVENTS)
        .singleElement()
        .satisfies(
            event -> {
              assertThat(event.outcome()).isEqualTo(Outcome.TIMEOUT);
              assertThat(event.degradedTo()).isEqualTo("client");
              assertThat(event.remoteId()).isEqualTo("slow");
            });
  }

  @Test
  void aRemoteErrorDegradesToTheClientAndLeavesATrace() {
    var microFrontend = onlyMicroFrontend(load("/mfe-broken"));
    assertThat(microFrontend.resolved()).isNull();
    assertThat(microFrontend.baseUrl()).isEqualTo(base + "/broken");
    assertThat(EVENTS)
        .singleElement()
        .satisfies(
            event -> {
              assertThat(event.outcome()).isEqualTo(Outcome.ERROR);
              assertThat(event.degradedTo()).isEqualTo("client");
              assertThat(event.error()).contains("HTTP 500");
              assertThat(event.correlationId()).isNotBlank();
            });
  }

  @Test
  void aUrlOutsideTheRegisteredRemotesIsAConfigurationErrorAndNothingIsAsked() {
    var increment = load("/mfe-unregistered");
    assertThat(REQUESTS).as("not even the registered one").isEmpty();
    assertThat(all(increment.fragments(), MicroFrontendDto.class)).isEmpty();
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .anySatisfy(text -> assertThat(text).contains("Reference"));
  }

  @Test
  void severalFragmentsAreAskedInParallel() {
    var started = System.nanoTime();
    var increment = load("/mfe-parallel");
    var elapsedMs = (System.nanoTime() - started) / 1_000_000;
    var microFrontends = all(increment.fragments(), MicroFrontendDto.class);
    assertThat(microFrontends).hasSize(3).allSatisfy(m -> assertThat(m.resolved()).isNotNull());
    assertThat(hits("delayed")).isEqualTo(3);
    // each takes 400 ms: in a row that is 1.2 s
    assertThat(elapsedMs).isLessThan(1100);
  }

  @Test
  void theRemoteGetsTheUsersIdentityAndTheCorrelationId() {
    load("/mfe-fast", Map.of("authorization", "Bearer alice", "X-Mateu-Correlation-Id", "corr-42"));
    assertThat(REQUESTS)
        .singleElement()
        .satisfies(
            request -> {
              assertThat(request.get("Authorization")).isEqualTo("Bearer alice");
              assertThat(request.get("X-Mateu-Correlation-Id")).isEqualTo("corr-42");
            });
  }

  @Test
  void aRemoteGetsTheIdentityItsStrategySays() {
    load("/mfe-anon");
    load("/mfe-exchanged");
    assertThat(REQUESTS).hasSize(2);
    assertThat(REQUESTS.get(0).get("Authorization")).as("none: anonymous").isNull();
    assertThat(REQUESTS.get(0).get("X-Mateu-Correlation-Id")).isNotBlank();
    assertThat(REQUESTS.get(1).get("Authorization")).isEqualTo("Bearer exchanged-for-exchanged");
  }

  @Test
  void aFragmentCachedByKeyIsSharedByCallersWithTheSameKey() {
    var first = onlyMicroFrontend(load("/mfe-cache-key", Map.of("authorization", "Bearer alice")));
    assertThat(texts(first.resolved())).containsExactly("content for aud-A");
    assertThat(hits("cachekey")).isEqualTo(1);

    // the same caller again, within the max age: from the cache, nobody asked
    var again = onlyMicroFrontend(load("/mfe-cache-key", Map.of("authorization", "Bearer alice")));
    assertThat(texts(again.resolved())).containsExactly("content for aud-A");
    assertThat(hits("cachekey")).isEqualTo(1);

    // another caller with the SAME key: the remote is told what the host holds and answers "yours"
    var anna = onlyMicroFrontend(load("/mfe-cache-key", Map.of("authorization", "Bearer anna")));
    assertThat(texts(anna.resolved())).containsExactly("content for aud-A");
    assertThat(REQUESTS.get(1).get("X-Mateu-Fragment-Keys")).isEqualTo("aud-A");
    assertThat(EVENTS.get(EVENTS.size() - 1).outcome()).isEqualTo(Outcome.FROM_CACHE);

    // another key: not from the cache
    var bob = onlyMicroFrontend(load("/mfe-cache-key", Map.of("authorization", "Bearer bob")));
    assertThat(texts(bob.resolved())).containsExactly("content for aud-B");
    assertThat(EVENTS.get(EVENTS.size() - 1).outcome()).isEqualTo(Outcome.EMBEDDED);
  }

  @Test
  void aFragmentCachedPerUserIsNotSharedBetweenUsers() {
    load("/mfe-cache-user", Map.of("authorization", "Bearer carol"));
    load("/mfe-cache-user", Map.of("authorization", "Bearer carol"));
    assertThat(hits("cacheuser")).isEqualTo(1);
    load("/mfe-cache-user", Map.of("authorization", "Bearer dave"));
    assertThat(hits("cacheuser")).isEqualTo(2);
  }

  @Test
  void aSharedFragmentIsCachedForEveryone() {
    load("/mfe-cache-shared", Map.of("authorization", "Bearer erin"));
    load("/mfe-cache-shared", Map.of("authorization", "Bearer frank"));
    assertThat(hits("cacheshared")).isEqualTo(1);
  }

  @Test
  void aFragmentDeclaredNoneIsNeverCached() {
    load("/mfe-cache-none");
    load("/mfe-cache-none");
    load("/mfe-cache-none");
    assertThat(hits("cachenone")).isEqualTo(3);
  }

  @Test
  void aContentSlotWithContentIsPaintedInTheSameResponse() {
    var increment = load("/slot-page");
    var slots = all(increment.fragments(), MicroFrontendDto.class);
    assertThat(slots).hasSize(1);
    assertThat(texts(slots.get(0).resolved())).containsExactly("slot front-office.home.destacado");
    // the url was built from the key, against the registered content remote
    assertThat(slots.get(0).baseUrl()).isEqualTo("/_content-hub");
    assertThat(REQUESTS)
        .extracting(r -> r.get("path"))
        .contains("/_content-hub/mateu/v3/sync/content-slots/front-office.home.destacado")
        .allSatisfy(path -> assertThat(path).startsWith("/_content-hub/"));
    assertThat(REQUESTS)
        .allSatisfy(r -> assertThat(r.get("Authorization")).isEqualTo("Bearer alice"));
    // the empty slot paints its fallback; the one without fallback paints nothing — and the client
    // is never handed a slot to ask for
    assertThat(texts(increment.fragments())).contains("Nothing yet").doesNotContain("No news");
    assertThat(all(increment.fragments(), ClientSideComponentDto.class))
        .extracting(ClientSideComponentDto::id)
        .doesNotContain("slot_front_office_home_vacio_sin_fallback");
    assertThat(EVENTS)
        .extracting(MicroFrontendResolutionEvent::slotKey, MicroFrontendResolutionEvent::outcome)
        .contains(
            org.assertj.core.groups.Tuple.tuple("front-office.home.destacado", Outcome.EMBEDDED),
            org.assertj.core.groups.Tuple.tuple("front-office.home.vacio", Outcome.EMPTY));
  }

  @Test
  void aContentSlotThatIsDownOrSlowPaintsItsFallbackAndTheScreenStands() {
    var started = System.nanoTime();
    var increment = load("/dead-slot-page");
    var elapsedMs = (System.nanoTime() - started) / 1_000_000;
    assertThat(all(increment.fragments(), MicroFrontendDto.class)).isEmpty();
    assertThat(texts(increment.fragments())).contains("Down fallback", "Slow fallback");
    assertThat(increment.messages()).isEmpty();
    assertThat(elapsedMs).isLessThan(1500);
    assertThat(EVENTS)
        .extracting(MicroFrontendResolutionEvent::outcome)
        .containsExactlyInAnyOrder(Outcome.ERROR, Outcome.TIMEOUT);
    assertThat(EVENTS).allSatisfy(e -> assertThat(e.degradedTo()).isEqualTo("fallback"));
  }

  @Test
  void theSlotDescriptorIsServedOnlyWhenEnabled() {
    var ask = RunActionRqDto.builder().route("/slot-page").actionId("__content_slots__").build();
    org.assertj.core.api.Assertions.assertThatThrownBy(() -> mateu.run(ask, Map.of()))
        .hasMessageContaining("mateu.content-slots.descriptor.enabled");
    System.setProperty("mateu.content-slots.descriptor.enabled", "true");
    try {
      var answer = mateu.run(ask, Map.of());
      assertThat(((Map<?, ?>) answer.appData()).containsKey("_contentSlots")).isTrue();
    } finally {
      System.clearProperty("mateu.content-slots.descriptor.enabled");
    }
  }
}
