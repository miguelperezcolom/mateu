package io.mateu.sample1.shell;

import io.mateu.uidl.LiveNotifications;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.MessagePersistence;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import reactor.core.publisher.Flux;

/** {@link InboxApp}'s screen: what makes something arrive in the inbox while the page is open. */
@Title("Inbox desk")
public class InboxDesk {

  private static final AtomicInteger PUBLICATIONS = new AtomicInteger();

  @Button
  @Label("Reset inbox")
  @Action(validationRequired = false)
  public Message resetInbox() {
    InboxApp.seed();
    return Message.success("Inbox reset");
  }

  /** What another part of the system does: store the entry, then tell the open sessions. */
  @Button
  @Label("Publish live")
  @Action(validationRequired = false)
  public Message publishLive() {
    var entry =
        new AppNotification(
            "live-1", "Server restarted", "Back online #" + PUBLICATIONS.incrementAndGet(), null);
    InboxApp.upsert(entry);
    LiveNotifications.publishToAll(entry);
    return Message.success("Published");
  }

  /** The same key every time: however many are sent, the inbox shows one entry. */
  @Button
  @Label("Save draft")
  @Action(validationRequired = false)
  public Message saveDraft() {
    return Message.success("Draft saved")
        .withPersistence(MessagePersistence.inbox)
        .withKey("draft-1");
  }

  /** A short background task that leaves an entry in the inbox when it finishes. */
  @Button
  @Label("Export in background")
  @Action(validationRequired = false)
  public Flux<?> exportInBackground() {
    return LongTask.create("Exporting")
        .background()
        .done("Export finished", "120 rows written")
        .notifyWhenDone()
        .run(
            progress ->
                Flux.range(1, 3)
                    .delayElements(Duration.ofMillis(200))
                    .map(i -> progress.step("Step " + i + " of 3", i, 3)));
  }
}
