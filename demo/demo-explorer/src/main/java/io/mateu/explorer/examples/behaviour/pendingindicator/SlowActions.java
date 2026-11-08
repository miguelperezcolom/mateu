package io.mateu.explorer.examples.behaviour.pendingindicator;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Actions that are slow or fail ON PURPOSE, to watch how the client copes — none of this needs code
 * in the app: the pending indicator, the double-submit guard, the retry policy and the friendly error
 * texts are the client's.
 */
@Title("A slow, unreliable backend")
public class SlowActions {

  @Help("How long 'Slow save' takes on the server")
  Integer delaySeconds = 3;

  static final AtomicInteger SAVES = new AtomicInteger();
  static final AtomicInteger READS = new AtomicInteger();

  /** While it runs the button is marked busy (aria-busy) and a second press sends nothing. */
  @Button
  Message slowSave() throws InterruptedException {
    Thread.sleep(Math.max(0, delaySeconds == null ? 0 : delaySeconds) * 1000L);
    return Message.success("Saved — the server received " + SAVES.incrementAndGet() + " save(s) so far");
  }

  /**
   * A READ marked idempotent with a 1.5 s ceiling: every other call is too slow, times out, and the
   * client RETRIES it on its own (only reads may be repeated: a timed-out write may have happened).
   */
  @Button
  @Action(timeoutMillis = 1500, idempotent = true)
  Message flakyRead() throws InterruptedException {
    int call = READS.incrementAndGet();
    if (call % 2 == 1) {
      Thread.sleep(4000); // this attempt times out on the client
    }
    return Message.success("Read OK on server call #" + call + " (the timed-out attempt was retried)");
  }

  /** A write that always times out: no automatic retry — the error offers a Retry control. */
  @Button
  @Action(timeoutMillis = 1500)
  Message writeThatTimesOut() throws InterruptedException {
    Thread.sleep(4000);
    return Message.success("Finally saved");
  }
}
