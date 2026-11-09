package io.mateu.core.infra;

import reactor.core.Disposables;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

/**
 * Learns how a stream starts before answering with it, for an adapter that has to choose a status
 * code first: a request is guarded lazily, as part of the stream, so a refusal only shows up as its
 * first signal.
 *
 * <p>The stream runs once and stays one stream: what the client has not read yet is held, what it
 * has read is gone, and when the client leaves the work is cancelled. {@code Flux.cache()} looks
 * like the same thing and is not: it keeps every element for good and never cancels its source.
 */
public final class StreamHandover {

  private StreamHandover() {}

  /**
   * Starts {@code source} and answers, once its first signal is known, the same stream from its
   * first element on. An error before any element fails the {@code Mono} — nothing was committed,
   * so the caller can still answer it — and an empty source answers an empty stream.
   */
  public static <T> Mono<Flux<T>> afterFirstSignal(Flux<T> source) {
    return Mono.create(
        answer -> {
          var work = Disposables.swap();
          var held = Sinks.many().unicast().<T>onBackpressureBuffer();
          var stream = held.asFlux().doOnCancel(work::dispose);
          var answered = new boolean[1];
          answer.onCancel(work);
          work.update(
              source
                  .contextWrite(context -> context.putAll(answer.contextView()))
                  .subscribe(
                      element -> {
                        held.tryEmitNext(element);
                        if (!answered[0]) {
                          answered[0] = true;
                          answer.success(stream);
                        }
                      },
                      error -> {
                        if (answered[0]) {
                          held.tryEmitError(error);
                        } else {
                          answered[0] = true;
                          answer.error(error);
                        }
                      },
                      () -> {
                        held.tryEmitComplete();
                        if (!answered[0]) {
                          answered[0] = true;
                          answer.success(stream);
                        }
                      }));
        });
  }
}
