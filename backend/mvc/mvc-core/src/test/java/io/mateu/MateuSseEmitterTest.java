package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.UIIncrementDto;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Sinks;

/** GA review java-core #9: a streamed action stops at the first send the client cannot take. */
class MateuSseEmitterTest {

  @Test
  void theStreamIsDisposedAtTheFirstFailedSend() {
    Sinks.Many<UIIncrementDto> source = Sinks.many().multicast().onBackpressureBuffer();
    var emitter = MateuSseEmitter.stream(source.asFlux());
    assertThat(source.currentSubscriberCount()).isEqualTo(1);
    emitter.complete(); // the client left: the container completed the emitter
    source.tryEmitNext(UIIncrementDto.builder().build());
    assertThat(source.currentSubscriberCount()).isZero();
  }
}
