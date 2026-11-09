package io.mateu.explorer.examples.behaviour.longtasks;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.LongTask;
import java.time.Duration;
import reactor.core.publisher.Flux;

/**
 * A long task streams its progress over Server-Sent Events: the action returns a {@code Flux}
 * built by {@link LongTask}, and the browser shows a progress dialog that moves WHILE the task
 * runs — one step per element — then the {@code done} message. The page must be a route of its own
 * (a mount's root view does not stream).
 */
@Title("Nightly rate update")
public class NightlyRateUpdate {

  @Button
  @Label("Update 5 rate plans")
  @Action(sse = true)
  public Flux<?> update() {
    return LongTask.create("Updating rate plans")
        .withProgressBar()
        .done("Rates updated", "All 5 rate plans were recalculated")
        .run(
            progress ->
                Flux.range(1, 5)
                    .delayElements(Duration.ofMillis(600))
                    .map(i -> progress.step("Rate plan " + i + " of 5", i / 5d)));
  }
}
