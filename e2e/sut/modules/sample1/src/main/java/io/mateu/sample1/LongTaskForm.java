package io.mateu.sample1;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.LongTask;
import java.time.Duration;
import reactor.core.publisher.Flux;

/**
 * Fixture for a streamed action: a {@link LongTask} reports its progress over Server-Sent Events
 * ({@code POST <baseUrl>/mateu/v3/sse/**}), one increment per step, so the progress dialog moves
 * WHILE the task runs. An adapter that answers the SSE path with one plain JSON body (WebFlux,
 * Quarkus and Helidon used to) shows nothing at all; one that buffers the stream shows only the end.
 *
 * <p>Not a {@code @UI} mount of its own: an inner route ({@code /long-task}) of the root mount,
 * declared in {@code specs/ui/sample1-routes.yaml} — the renderers only stream an action whose
 * route is not empty, so it must not be the root view of a mount.
 */
@Title("Long task")
public class LongTaskForm {

  @Button
  @Label("Run long task")
  @Action(validationRequired = false)
  public Flux<?> runLongTask() {
    return LongTask.create("Processing")
        .withProgressBar()
        .done("Long task finished", "All 5 steps processed")
        .run(
            progress ->
                Flux.range(1, 5)
                    .delayElements(Duration.ofMillis(400))
                    .map(i -> progress.step("Step " + i + " of 5", i / 5d)));
  }
}
