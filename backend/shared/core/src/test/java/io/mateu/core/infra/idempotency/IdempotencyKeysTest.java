package io.mateu.core.infra.idempotency;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.security.CallerIdentity;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * The idempotency table's two halves: runs in flight are never evicted (a full table refuses a new
 * key instead), finished answers are LRU + TTL, and a late completion only ever settles its own
 * run.
 */
class IdempotencyKeysTest {

  private static final String MAX = "mateu.idempotency.max-entries";
  private static final String PER_CALLER = "mateu.idempotency.max-entries-per-caller";

  @BeforeEach
  void reset() {
    IdempotencyKeys.clear();
  }

  @AfterEach
  void restore() {
    System.clearProperty(MAX);
    System.clearProperty(PER_CALLER);
    IdempotencyKeys.clear();
  }

  @Test
  void theCallerScopeChangesWhenOnlyGroupsScopesOrPermissionsDiffer() {
    var base = new CallerIdentity("ana", List.of("clerk"), List.of(), List.of(), List.of());
    var withGroup = new CallerIdentity("ana", List.of("clerk"), List.of("g"), List.of(), List.of());
    var withScope = new CallerIdentity("ana", List.of("clerk"), List.of(), List.of("s"), List.of());
    var withPermission =
        new CallerIdentity("ana", List.of("clerk"), List.of(), List.of(), List.of("p"));
    var callers =
        List.of(
            IdempotencyKeys.caller(base),
            IdempotencyKeys.caller(withGroup),
            IdempotencyKeys.caller(withScope),
            IdempotencyKeys.caller(withPermission));
    assertThat(callers).doesNotHaveDuplicates();
    // canonical: the order of the grants does not matter
    assertThat(
            IdempotencyKeys.caller(
                new CallerIdentity("ana", List.of("b", "a"), List.of(), List.of(), List.of())))
        .isEqualTo(
            IdempotencyKeys.caller(
                new CallerIdentity("ana", List.of("a", "b"), List.of(), List.of(), List.of())));
  }

  @Test
  void theViewIsNormalisedLikeInThePorts() {
    assertThat(IdempotencyKeys.view(" a.B ", "/orders/7/edit/"))
        .isEqualTo(IdempotencyKeys.view("a.B", "orders/7/edit"))
        .isEqualTo("type=a.B\u0001route=orders/7/edit");
    assertThat(IdempotencyKeys.view(null, null)).isEqualTo("type=\u0001route=");
    assertThat(IdempotencyKeys.view("a.B", "orders"))
        .isNotEqualTo(IdempotencyKeys.view("a.C", "orders"));
  }

  @Test
  void aFullInFlightTableRefusesANewKeyAndNeverEvictsTheRunningOne() {
    System.setProperty(MAX, "1");
    var runs = new AtomicInteger();
    Sinks.One<UIIncrementDto> gate = Sinks.one();

    var a = IdempotencyKeys.once(request("key-aaaa-0001"), "save", () -> blocked(runs, gate));
    var firstA = a.collectList().toFuture();
    assertThat(runs.get()).isEqualTo(1);
    assertThat(IdempotencyKeys.inFlight()).isEqualTo(1);

    // B arrives while A is in flight and the table is full: refused, A untouched
    var b = IdempotencyKeys.once(request("key-bbbb-0002"), "save", () -> blocked(runs, gate));
    Throwable refusal = null;
    try {
      b.collectList().block();
    } catch (RuntimeException e) {
      refusal = e;
    }
    assertThat(refusal).isInstanceOf(UserFacingException.class);
    assertThat(((UserFacingException) refusal).title()).isEqualTo(IdempotencyKeys.BUSY_TITLE);
    assertThat(IdempotencyKeys.inFlight()).isEqualTo(1);

    // a retry of A joins A: never a second execution
    var retryA =
        IdempotencyKeys.once(request("key-aaaa-0001"), "save", () -> blocked(runs, gate))
            .collectList()
            .toFuture();
    assertThat(runs.get()).isEqualTo(1);

    gate.tryEmitValue(UIIncrementDto.builder().build());
    assertThat(firstA.join()).hasSize(1);
    assertThat(retryA.join()).hasSize(1);
    assertThat(runs.get()).isEqualTo(1);
    assertThat(IdempotencyKeys.inFlight()).isZero();

    // once A finished, B is admitted
    IdempotencyKeys.once(request("key-bbbb-0002"), "save", () -> answered(runs))
        .collectList()
        .block();
    assertThat(runs.get()).isEqualTo(2);
  }

  @Test
  void aLateCompletionNeverRemovesANewerRunOfTheSameKey() {
    var runs = new AtomicInteger();
    Sinks.One<UIIncrementDto> oldGate = Sinks.one();
    Sinks.One<UIIncrementDto> newGate = Sinks.one();

    var old =
        IdempotencyKeys.once(request("key-cccc-0003"), "save", () -> blocked(runs, oldGate))
            .collectList()
            .toFuture();
    // the old run's entry goes (as a restart of the table would), a newer run takes the key
    IdempotencyKeys.clear();
    var newer =
        IdempotencyKeys.once(request("key-cccc-0003"), "save", () -> blocked(runs, newGate))
            .collectList()
            .toFuture();
    assertThat(runs.get()).isEqualTo(2);

    // the old run ends: the newer one is still the key's run in flight
    oldGate.tryEmitValue(UIIncrementDto.builder().build());
    old.join();
    assertThat(IdempotencyKeys.inFlight()).isEqualTo(1);
    var repeat =
        IdempotencyKeys.once(request("key-cccc-0003"), "save", () -> blocked(runs, newGate))
            .collectList()
            .toFuture();
    assertThat(runs.get()).isEqualTo(2);

    newGate.tryEmitValue(UIIncrementDto.builder().build());
    newer.join();
    repeat.join();
    assertThat(IdempotencyKeys.inFlight()).isZero();
  }

  @Test
  void finishedAnswersAreEvictedLeastRecentlyUsedFirst() {
    System.setProperty(MAX, "1");
    var runs = new AtomicInteger();
    IdempotencyKeys.once(request("key-dddd-0004"), "save", () -> answered(runs))
        .collectList()
        .block();
    IdempotencyKeys.once(request("key-eeee-0005"), "save", () -> answered(runs))
        .collectList()
        .block();
    // the first answer was evicted (finished, so safe to forget): its key runs again
    IdempotencyKeys.once(request("key-dddd-0004"), "save", () -> answered(runs))
        .collectList()
        .block();
    assertThat(runs.get()).isEqualTo(3);
  }

  /**
   * GA review java-core #5: the client's timeout drops the connection (the request is cancelled)
   * while the write is still running elsewhere; the retry of the key must JOIN that run, never
   * start a second one.
   */
  @Test
  void aClientThatLeavesNeitherStopsTheRunNorReleasesItsKey() throws Exception {
    var started = new AtomicInteger();
    var applied = new AtomicInteger();
    Sinks.One<UIIncrementDto> gate = Sinks.one();
    java.util.function.Supplier<Flux<UIIncrementDto>> write =
        () -> {
          started.incrementAndGet();
          // work that does not stop on cancel (a statement already sent, another thread)
          return gate.asMono().doOnNext(ignored -> applied.incrementAndGet()).flux();
        };
    var first = IdempotencyKeys.once(request("key-ffff-0006"), "save", write).subscribe();
    first.dispose(); // the client left
    assertThat(IdempotencyKeys.inFlight()).isEqualTo(1);
    var retry =
        IdempotencyKeys.once(request("key-ffff-0006"), "save", write).collectList().toFuture();
    gate.tryEmitValue(UIIncrementDto.builder().build());
    assertThat(retry.get(5, java.util.concurrent.TimeUnit.SECONDS)).hasSize(1);
    assertThat(started.get()).isEqualTo(1);
    assertThat(applied.get()).isEqualTo(1);
    assertThat(IdempotencyKeys.inFlight()).isZero();
  }

  /** GA review S10: each caller has its own share of both tables. */
  @Test
  void oneCallerCanNeitherFillTheTableNorEvictAnothersAnswers() {
    System.setProperty(PER_CALLER, "1");
    var runs = new AtomicInteger();
    Sinks.One<UIIncrementDto> gate = Sinks.one();
    var ana =
        IdempotencyKeys.once(request("key-ana1-0001", "ana"), "save", () -> blocked(runs, gate))
            .collectList()
            .toFuture();
    // ana's second key while her first is in flight: refused; bea is admitted
    Throwable refusal = null;
    try {
      IdempotencyKeys.once(request("key-ana2-0002", "ana"), "save", () -> answered(runs))
          .collectList()
          .block();
    } catch (RuntimeException e) {
      refusal = e;
    }
    assertThat(refusal).isInstanceOf(UserFacingException.class);
    IdempotencyKeys.once(request("key-bea1-0001", "bea"), "save", () -> answered(runs))
        .collectList()
        .block();
    gate.tryEmitValue(UIIncrementDto.builder().build());
    ana.join();
    assertThat(runs.get()).isEqualTo(2);
    // ana finishes many more keys: only HER oldest answers go; bea's is still replayed
    IdempotencyKeys.once(request("key-ana3-0003", "ana"), "save", () -> answered(runs))
        .collectList()
        .block();
    IdempotencyKeys.once(request("key-ana4-0004", "ana"), "save", () -> answered(runs))
        .collectList()
        .block();
    var before = runs.get();
    IdempotencyKeys.once(request("key-bea1-0001", "bea"), "save", () -> answered(runs))
        .collectList()
        .block();
    assertThat(runs.get()).isEqualTo(before);
  }

  @Test
  void aKeySentAgainWithAnotherRequestIsRefused() {
    var runs = new AtomicInteger();
    IdempotencyKeys.once(
            request("key-gggg-0007", null, Map.of("amount", 10)), "save", () -> answered(runs))
        .collectList()
        .block();
    Throwable refusal = null;
    try {
      IdempotencyKeys.once(
              request("key-gggg-0007", null, Map.of("amount", 1000)), "save", () -> answered(runs))
          .collectList()
          .block();
    } catch (RuntimeException e) {
      refusal = e;
    }
    assertThat(refusal).isInstanceOf(UserFacingException.class);
    assertThat(((UserFacingException) refusal).title()).isEqualTo(IdempotencyKeys.REUSED_TITLE);
    // the same request again is a retry: answered from memory
    IdempotencyKeys.once(
            request("key-gggg-0007", null, Map.of("amount", 10)), "save", () -> answered(runs))
        .collectList()
        .block();
    assertThat(runs.get()).isEqualTo(1);
  }

  private static Flux<UIIncrementDto> blocked(AtomicInteger runs, Sinks.One<UIIncrementDto> gate) {
    runs.incrementAndGet();
    return gate.asMono().flux();
  }

  private static Flux<UIIncrementDto> answered(AtomicInteger runs) {
    runs.incrementAndGet();
    return Flux.just(UIIncrementDto.builder().build());
  }

  private static FakeHttpRequest request(String key) {
    return request(key, null);
  }

  private static FakeHttpRequest request(String key, String role) {
    return request(key, role, Map.of());
  }

  private static FakeHttpRequest request(String key, String role, Map<String, Object> state) {
    var request =
        new FakeHttpRequest(RunActionRqDto.builder().actionId("save").componentState(state).build())
            .withHeader(IdempotencyKeys.HEADER, key);
    return role == null
        ? request
        : request.withHeader(io.mateu.core.testutil.TestIdentities.ROLES_HEADER, role);
  }
}
