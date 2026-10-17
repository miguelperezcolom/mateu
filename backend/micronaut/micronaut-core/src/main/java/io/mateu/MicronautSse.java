package io.mateu;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.dtos.UIIncrementDto;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The streamed leg ({@code /v3/sse/}) of the generated controllers and the YAML mounts. A refusal
 * is answered 403 before the stream is committed: Micronaut does not route an error of a {@code
 * text/event-stream} route to {@link MateuForbiddenExceptionHandler}, so a refused streamed action
 * answered 500. The stream is answered once its FIRST signal is known — a request is guarded
 * lazily, as part of the stream — and replays that first event to the client.
 */
public final class MicronautSse {

  /** The request, run: what it streams. */
  @FunctionalInterface
  public interface Run {
    Flux<UIIncrementDto> get() throws Throwable;
  }

  private MicronautSse() {}

  public static Mono<HttpResponse<?>> stream(Run run) throws Throwable {
    Flux<UIIncrementDto> events;
    try {
      events = run.get();
    } catch (MateuForbiddenException e) {
      return Mono.just(forbidden());
    }
    var replayed = events.cache();
    return replayed
        .next()
        .<HttpResponse<?>>map(first -> sse(replayed))
        .switchIfEmpty(Mono.fromSupplier(() -> sse(Flux.empty())))
        .onErrorResume(MicronautSse::refusal, e -> Mono.just(forbidden()));
  }

  private static HttpResponse<?> sse(Flux<UIIncrementDto> events) {
    return HttpResponse.ok(events).contentType(MediaType.TEXT_EVENT_STREAM_TYPE);
  }

  private static boolean refusal(Throwable t) {
    for (var cause = t; cause != null; cause = cause.getCause()) {
      if (cause instanceof MateuForbiddenException) {
        return true;
      }
    }
    return false;
  }

  private static HttpResponse<?> forbidden() {
    return HttpResponse.<String>status(HttpStatus.FORBIDDEN)
        .contentType(MediaType.TEXT_PLAIN_TYPE)
        .body(MateuForbiddenException.publicMessage());
  }
}
