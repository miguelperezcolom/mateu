package io.mateu;

import io.mateu.dtos.UIIncrementDto;
import reactor.core.publisher.Flux;

/**
 * The streamed leg ({@code /v3/sse/}) of the generated JAX-RS controllers. A request is guarded
 * lazily, as part of the stream, and a refused one used to surface after the SSE response was
 * committed (a 200 stream cut short). The first signal is awaited here (the endpoint is
 * {@code @Blocking}): a refusal is thrown before anything is committed — {@code
 * MateuForbiddenExceptionMapper} answers it 403 — and the events, the first one included, are
 * replayed to the client.
 */
public final class QuarkusSse {

  private QuarkusSse() {}

  public static Flux<UIIncrementDto> guarded(Flux<UIIncrementDto> events) {
    var replayed = events.cache();
    replayed.blockFirst();
    return replayed;
  }
}
