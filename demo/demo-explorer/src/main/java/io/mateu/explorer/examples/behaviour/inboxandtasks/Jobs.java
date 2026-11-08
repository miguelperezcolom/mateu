package io.mateu.explorer.examples.behaviour.inboxandtasks;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.Message;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import reactor.core.publisher.Flux;

/**
 * Background work, two ways:
 *
 * <ul>
 *   <li><b>with progress</b> — a {@link LongTask}: the answer is a stream; a dialog shows each step
 *       and the progress bar while the job runs;
 *   <li><b>fire and forget</b> — {@code @Action(background = true)}: no busy indicator, the screen
 *       stays usable; the job leaves a notification in the inbox when it is done.
 * </ul>
 */
@Title("Jobs")
public class Jobs {

  @Button
  @Action(validationRequired = false)
  public Flux<?> rebuildIndex() {
    int total = 5;
    return LongTask.create("Rebuilding the search index…")
        .withProgressBar()
        .done("Done", "The index was rebuilt")
        .closeAfter(3)
        .run(
            progress ->
                Flux.range(1, total)
                    .delayElements(Duration.ofMillis(700))
                    .map(i -> progress.step("Shard " + i + " of " + total, i / (double) total))
                    .doOnComplete(() -> InboxDemoApp.notify("Index rebuilt", "5 shards")));
  }

  @Button
  @Action(background = true)
  public Message exportInTheBackground() {
    CompletableFuture.runAsync(
        () -> InboxDemoApp.notify("Export ready", "Your export finished in the background"),
        CompletableFuture.delayedExecutor(3, TimeUnit.SECONDS));
    return new Message("Export started — you will find it in the inbox (the bell) in a few seconds");
  }
}
