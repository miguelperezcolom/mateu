package io.mateu;

import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.UIIncrementDto;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseEventSink;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Stream;
import reactor.core.publisher.Flux;

/**
 * A streamed action answered through Jersey — what a Helidon MP app that authenticates in JAX-RS
 * (MicroProfile JWT, a {@code ContainerRequestFilter}) needs, because its identity exists only
 * there — event by event, as it is produced.
 *
 * <p>A {@code StreamingOutput} is buffered by Jersey until the action ends (its first 8 KB are held
 * to compute a Content-Length, and a {@code flush()} before that does nothing), so the progress of
 * a {@code LongTask} arrived all at once. A {@link SseEventSink} is Jersey's chunked output: each
 * {@code send} is written and flushed. Its events are only written once the resource method has
 * returned, so the method waits for the FIRST increment (a refusal still answers 403 through the
 * exception mapper) and the rest is sent from a virtual thread.
 */
public final class JerseySse {

  private static final Logger LOG = Logger.getLogger(JerseySse.class.getName());

  private JerseySse() {}

  /**
   * Streams {@code increments} to {@code sink}. Throws what producing the first increment threw —
   * before anything is committed, so the exception mappers still answer it.
   */
  public static void stream(Flux<UIIncrementDto> increments, SseEventSink sink, Sse sse)
      throws Exception {
    Stream<UIIncrementDto> stream = increments.toStream();
    Iterator<UIIncrementDto> events = stream.iterator();
    boolean any;
    try {
      any = events.hasNext();
    } catch (RuntimeException e) {
      stream.close();
      throw unwrap(e);
    }
    if (!any) {
      stream.close();
      sink.close();
      return;
    }
    var first = events.next();
    Thread.ofVirtual()
        .name("mateu-sse")
        .start(
            () -> {
              // closing the Stream is what cancels the work when the client leaves
              try (stream;
                  sink) {
                send(sink, sse, first);
                while (!sink.isClosed() && events.hasNext()) {
                  send(sink, sse, events.next());
                }
              } catch (Exception e) {
                // the client went away (the send failed) or the action failed mid-stream
                LOG.log(Level.FINE, "mateu: stream ended", e);
              }
            });
  }

  private static void send(SseEventSink sink, Sse sse, UIIncrementDto increment) throws Exception {
    String json = WireMapper.shared().writeValueAsString(increment);
    sink.send(sse.newEventBuilder().data(String.class, json).build()).toCompletableFuture().get();
  }

  private static Exception unwrap(RuntimeException e) {
    // reactor wraps a checked exception (a MateuForbiddenException is unchecked: kept as it is)
    if (e.getClass().getName().startsWith("reactor.") && e.getCause() instanceof Exception cause) {
      return cause;
    }
    return e;
  }
}
