package io.mateu;

import io.mateu.dtos.UIIncrementDto;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;

/**
 * A streamed action answered over Spring MVC: one {@code data:} event per increment. The stream is
 * DISPOSED as soon as the client leaves — the emitter completes, times out or fails, or a send
 * fails — so a {@code _live-updates} subscription or a silent long task stops with the tab instead
 * of running until two more emissions happen to fail (GA review java-core #9).
 */
public final class MateuSseEmitter {

  private MateuSseEmitter() {}

  public static SseEmitter stream(Flux<UIIncrementDto> increments) {
    var emitter = new SseEmitter(0L);
    var subscription = new AtomicReference<Disposable>();
    Runnable dispose =
        () -> {
          var running = subscription.getAndSet(null);
          if (running != null) {
            running.dispose();
          }
        };
    emitter.onCompletion(dispose);
    emitter.onTimeout(dispose);
    emitter.onError(failure -> dispose.run());
    subscription.set(
        increments.subscribe(
            increment -> {
              try {
                emitter.send(SseEmitter.event().data(increment, MediaType.APPLICATION_JSON));
              } catch (IOException | IllegalStateException e) {
                // the client left: stop producing, and say so to the container
                dispose.run();
                try {
                  emitter.completeWithError(e);
                } catch (IllegalStateException alreadyDone) {
                  // completed already
                }
              }
            },
            emitter::completeWithError,
            emitter::complete));
    return emitter;
  }
}
