package io.mateu.explorer.examples.behaviour.timeoutsretries;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Transport knobs per action. {@code timeoutMillis} is how long the browser waits before giving up
 * (default 60 s) — a type-ahead wants seconds, an export minutes. {@code idempotent = true} says a
 * repeat cannot apply the change twice, so after a transient failure (a timeout, a 5xx) the client
 * may retry it by itself — reads are retried anyway; a write never is unless you say so.
 */
@Title("Availability")
public class AvailabilityCheck {

  static final AtomicInteger CALLS = new AtomicInteger();

  @Button
  @Label("Slow check (gives up after 1.5 s)")
  @Action(timeoutMillis = 1500)
  Message slowCheck() throws InterruptedException {
    Thread.sleep(4000);
    return Message.success("You will not see this: the browser stopped waiting");
  }

  @Button
  @Label("Flaky check (idempotent, retried)")
  @Action(idempotent = true, timeoutMillis = 1500)
  Message flakyCheck() throws InterruptedException {
    // every other call is too slow; the client retries it and the next one answers
    if (CALLS.incrementAndGet() % 2 == 1) {
      Thread.sleep(3000);
    }
    return Message.success("Room 214 is available (call #" + CALLS.get() + ")");
  }
}
