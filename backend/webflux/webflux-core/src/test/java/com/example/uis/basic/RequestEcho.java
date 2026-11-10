package com.example.uis.basic;

import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Echoes what its action reads off the {@link HttpRequest}: the adapter must hand the UI the query
 * parameters and headers of the HTTP request it received.
 */
@UI("/echo")
@Title("Request echo")
public class RequestEcho {

  private static final java.util.concurrent.atomic.AtomicBoolean FEED_CANCELLED =
      new java.util.concurrent.atomic.AtomicBoolean();

  /** Ticks until its client leaves: {@code cancelsTheWorkWhenTheStreamsClientLeaves}. */
  @Button
  public reactor.core.publisher.Flux<Message> liveFeed() {
    FEED_CANCELLED.set(false);
    return reactor.core.publisher.Flux.interval(java.time.Duration.ofMillis(100))
        .map(tick -> new Message("tick"))
        .doOnCancel(() -> FEED_CANCELLED.set(true));
  }

  @Button
  public Message feedCancelled() {
    return new Message("feed-cancelled=" + FEED_CANCELLED.get());
  }

  @Button
  public Message echo(HttpRequest httpRequest) {
    return new Message(AdapterParityITFoundation.echo(httpRequest));
  }
}
