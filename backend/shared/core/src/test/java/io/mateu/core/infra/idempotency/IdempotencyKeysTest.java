package io.mateu.core.infra.idempotency;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.security.CallerIdentity;
import java.util.List;
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

  @BeforeEach
  void reset() {
    IdempotencyKeys.clear();
  }

  @AfterEach
  void restore() {
    System.clearProperty(MAX);
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

  private static Flux<UIIncrementDto> blocked(AtomicInteger runs, Sinks.One<UIIncrementDto> gate) {
    runs.incrementAndGet();
    return gate.asMono().flux();
  }

  private static Flux<UIIncrementDto> answered(AtomicInteger runs) {
    runs.incrementAndGet();
    return Flux.just(UIIncrementDto.builder().build());
  }

  private static FakeHttpRequest request(String key) {
    return new FakeHttpRequest(RunActionRqDto.builder().actionId("save").build())
        .withHeader(IdempotencyKeys.HEADER, key);
  }
}
