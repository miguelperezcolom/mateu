package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.dtos.UIIncrementDto;
import jakarta.ws.rs.sse.OutboundSseEvent;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseBroadcaster;
import jakarta.ws.rs.sse.SseEventSink;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * A streamed action answered through Jersey ({@link JerseySse}): each increment is sent as its own
 * event when it is produced, a failure before the first one is thrown (so the exception mappers
 * answer it), and the work is cancelled when the client goes away.
 */
class JerseySseTest {

  /** The events a sink received, as their JSON data, and whether it was closed. */
  static final class RecordingSink implements SseEventSink {
    final List<String> sent = new CopyOnWriteArrayList<>();
    final CountDownLatch closedLatch = new CountDownLatch(1);
    volatile boolean closed;
    volatile int failAfter = Integer.MAX_VALUE;
    volatile int closeAfter = Integer.MAX_VALUE;
    final java.util.concurrent.Semaphore eachSend = new java.util.concurrent.Semaphore(0);

    @Override
    public boolean isClosed() {
      return closed;
    }

    @Override
    public CompletionStage<?> send(OutboundSseEvent event) {
      if (sent.size() >= failAfter) {
        return CompletableFuture.failedFuture(new java.io.IOException("the client went away"));
      }
      sent.add((String) event.getData());
      if (sent.size() >= closeAfter) {
        closed = true;
      }
      eachSend.release();
      return CompletableFuture.completedFuture(null);
    }

    @Override
    public void close() {
      closed = true;
      closedLatch.countDown();
    }

    boolean awaitClosed() throws InterruptedException {
      return closedLatch.await(5, TimeUnit.SECONDS);
    }
  }

  /** The minimal {@link Sse}: an event builder that keeps the data. */
  static final class PlainSse implements Sse {
    @Override
    public OutboundSseEvent.Builder newEventBuilder() {
      var data = new Object[1];
      return (OutboundSseEvent.Builder)
          java.lang.reflect.Proxy.newProxyInstance(
              OutboundSseEvent.Builder.class.getClassLoader(),
              new Class<?>[] {OutboundSseEvent.Builder.class},
              (proxy, method, args) -> {
                if ("build".equals(method.getName())) {
                  return Fakes.fake(OutboundSseEvent.class, Map.of("getData", data[0]));
                }
                if ("data".equals(method.getName())) {
                  data[0] = args[args.length - 1];
                }
                return method.getReturnType().isInstance(proxy) ? proxy : null;
              });
    }

    @Override
    public SseBroadcaster newBroadcaster() {
      throw new UnsupportedOperationException();
    }
  }

  private static UIIncrementDto increment(int n) {
    return UIIncrementDto.builder().appData(Map.of("tick", n)).build();
  }

  @Test
  void sendsEveryIncrementAsItsOwnEventAndClosesTheSink() throws Exception {
    var sink = new RecordingSink();
    JerseySse.stream(Flux.just(increment(1), increment(2), increment(3)), sink, new PlainSse());

    assertTrue(sink.awaitClosed());
    assertEquals(3, sink.sent.size());
    for (int i = 0; i < 3; i++) {
      assertTrue(sink.sent.get(i).contains("\"tick\":" + (i + 1)), sink.sent.get(i));
    }
  }

  @Test
  void eachEventIsSentWhenItIsProducedNotWhenTheActionEnds() throws Exception {
    var producer = Sinks.many().unicast().<UIIncrementDto>onBackpressureBuffer();
    var sink = new RecordingSink();
    producer.tryEmitNext(increment(1));
    // stream returns once the first increment exists; the rest follows on its own thread
    JerseySse.stream(producer.asFlux(), sink, new PlainSse());

    assertTrue(sink.eachSend.tryAcquire(5, TimeUnit.SECONDS));
    assertEquals(1, sink.sent.size());
    // the action is still running: the second tick arrives only when it is produced
    producer.tryEmitNext(increment(2));
    assertTrue(sink.eachSend.tryAcquire(5, TimeUnit.SECONDS));
    assertEquals(2, sink.sent.size());
    producer.tryEmitComplete();
    assertTrue(sink.awaitClosed());
  }

  @Test
  void anActionThatProducesNothingClosesTheSink() throws Exception {
    var sink = new RecordingSink();
    JerseySse.stream(Flux.empty(), sink, new PlainSse());
    assertTrue(sink.closed);
    assertTrue(sink.sent.isEmpty());
  }

  @Test
  void aRefusalBeforeTheFirstEventIsThrownAsItIs() {
    var sink = new RecordingSink();
    var refusal = new MateuForbiddenException("no");
    var thrown =
        assertThrows(
            MateuForbiddenException.class,
            () -> JerseySse.stream(Flux.error(refusal), sink, new PlainSse()));
    assertSame(refusal, thrown);
    // nothing committed: the exception mapper still answers the request
    assertTrue(sink.sent.isEmpty());
  }

  @Test
  void aCheckedExceptionReactorWrappedIsUnwrapped() {
    var sink = new RecordingSink();
    var checked = new java.io.IOException("backend down");
    var thrown =
        assertThrows(
            Exception.class, () -> JerseySse.stream(Flux.error(checked), sink, new PlainSse()));
    assertSame(checked, thrown);
  }

  @Test
  void anUncheckedFailureIsThrownAsItIs() {
    var sink = new RecordingSink();
    var failure = new IllegalStateException("boom");
    var thrown =
        assertThrows(
            IllegalStateException.class,
            () -> JerseySse.stream(Flux.error(failure), sink, new PlainSse()));
    assertSame(failure, thrown);
  }

  @Test
  void whenTheClientLeavesTheWorkIsCancelled() throws Exception {
    var cancelled = new AtomicBoolean();
    var sink = new RecordingSink();
    sink.failAfter = 1; // the second send fails: the client went away
    JerseySse.stream(
        Flux.interval(java.time.Duration.ofMillis(10))
            .map(n -> increment(n.intValue()))
            .doOnCancel(() -> cancelled.set(true)),
        sink,
        new PlainSse());

    assertTrue(sink.awaitClosed());
    assertEquals(1, sink.sent.size());
    waitFor(cancelled);
  }

  @Test
  void aSinkClosedByJerseyStopsTheStream() throws Exception {
    var cancelled = new AtomicBoolean();
    var sink = new RecordingSink();
    sink.closeAfter = 2;
    JerseySse.stream(
        Flux.interval(java.time.Duration.ofMillis(10))
            .map(n -> increment(n.intValue()))
            .doOnCancel(() -> cancelled.set(true)),
        sink,
        new PlainSse());

    assertTrue(sink.awaitClosed());
    assertEquals(2, sink.sent.size());
    waitFor(cancelled);
  }

  @Test
  void aFailureMidStreamEndsItQuietly() throws Exception {
    var sink = new RecordingSink();
    JerseySse.stream(
        Flux.just(increment(1))
            .concatWith(
                reactor.core.publisher.Mono.delay(java.time.Duration.ofMillis(50))
                    .then(reactor.core.publisher.Mono.error(new IllegalStateException("mid")))),
        sink,
        new PlainSse());
    assertTrue(sink.awaitClosed());
    assertEquals(1, sink.sent.size());
  }

  private static void waitFor(AtomicBoolean flag) throws InterruptedException {
    for (int i = 0; i < 500 && !flag.get(); i++) {
      Thread.sleep(10);
    }
    assertTrue(flag.get(), "the work was not cancelled");
  }
}
