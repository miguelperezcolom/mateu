package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/** Knowing how a stream starts must not change what the stream is. */
class StreamHandoverTest {

  @Test
  void theCallerGetsTheWholeStreamFromItsFirstElement() {
    var stream = StreamHandover.afterFirstSignal(Flux.just(1, 2, 3)).block();
    assertThat(stream.collectList().block()).containsExactly(1, 2, 3);
  }

  @Test
  void anErrorBeforeAnyElementFailsTheAnswer() {
    var answer = StreamHandover.afterFirstSignal(Flux.error(new IllegalStateException("refused")));
    assertThatThrownBy(answer::block).hasMessageContaining("refused");
  }

  @Test
  void anErrorAfterTheFirstElementTravelsInTheStream() {
    var source = Flux.just(1).concatWith(Flux.error(new IllegalStateException("late")));
    var stream = StreamHandover.afterFirstSignal(source).block();
    assertThatThrownBy(() -> stream.collectList().block()).hasMessageContaining("late");
  }

  @Test
  void anEmptySourceAnswersAnEmptyStream() {
    var stream = StreamHandover.afterFirstSignal(Flux.<Integer>empty()).block();
    assertThat(stream.collectList().block()).isEmpty();
  }

  @Test
  void aClientThatLeavesCancelsTheWork() {
    var cancelled = new AtomicBoolean();
    var source = Sinks.many().unicast().<Integer>onBackpressureBuffer();
    source.tryEmitNext(1);

    var stream =
        StreamHandover.afterFirstSignal(source.asFlux().doOnCancel(() -> cancelled.set(true)))
            .block();
    var subscription = stream.subscribe();
    assertThat(cancelled).isFalse();

    subscription.dispose();
    assertThat(cancelled).isTrue();
  }

  @Test
  void leavingBeforeTheFirstSignalCancelsTheWork() {
    var cancelled = new AtomicBoolean();
    var answer =
        StreamHandover.afterFirstSignal(Flux.never().doOnCancel(() -> cancelled.set(true)));
    answer.subscribe().dispose();
    assertThat(cancelled).isTrue();
  }

  @Test
  void theSourceIsSubscribedOnce() {
    var subscriptions = new AtomicInteger();
    var stream =
        StreamHandover.afterFirstSignal(
                Flux.just(1, 2).doOnSubscribe(s -> subscriptions.incrementAndGet()))
            .block();
    stream.collectList().block();
    assertThat(subscriptions).hasValue(1);
  }
}
