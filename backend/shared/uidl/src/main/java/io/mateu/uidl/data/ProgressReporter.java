package io.mateu.uidl.data;

import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.UnaryOperator;

/**
 * Reports the progress of the task run by {@link LongTask}. Each {@code step} returns the update to
 * stream — the item the work flux must emit, not a side effect:
 *
 * <pre>{@code
 * .run(progress -> Flux.range(1, total)
 *         .map(i -> progress.step("Processed: " + i, i, total)))
 * }</pre>
 *
 * <p>Every update carries the whole current state of the task (a {@code Progress} command), so each
 * renderer shows it its own way: a modal progress, its task center, the IDE's background-task
 * indicator…
 *
 * <p>An instance is provided by {@link LongTask#run}; callers do not construct it.
 */
public class ProgressReporter {

  private final AtomicReference<ProgressDto> current;
  private final boolean progressBar;

  ProgressReporter(ProgressDto initial, boolean progressBar) {
    this.current = new AtomicReference<>(initial);
    this.progressBar = progressBar;
  }

  /** The task's current state (what the last update said). */
  ProgressDto current() {
    return current.get();
  }

  Object update(UnaryOperator<ProgressDto> change) {
    return increment(current.updateAndGet(change));
  }

  static UIIncrementDto increment(ProgressDto progress) {
    return increment(progress, List.of());
  }

  static UIIncrementDto increment(ProgressDto progress, List<UICommandDto> more) {
    return increment(progress, more, List.of());
  }

  static UIIncrementDto increment(
      ProgressDto progress, List<UICommandDto> more, List<io.mateu.dtos.MessageDto> messages) {
    var commands = new java.util.ArrayList<UICommandDto>();
    commands.add(new UICommandDto(null, UICommandTypeDto.Progress, progress));
    commands.addAll(more);
    return UIIncrementDto.builder()
        .commands(commands)
        .messages(messages)
        .wireVersion(UIIncrementDto.WIRE_VERSION)
        .build();
  }

  /**
   * Updates the status text.
   *
   * @param text what the task is doing now
   */
  public Object step(String text) {
    return update(p -> p.toBuilder().text(text).build());
  }

  /**
   * Updates the status text and the task's title.
   *
   * @param text new status message
   * @param title new title
   */
  public Object step(String text, String title) {
    return update(p -> p.toBuilder().text(text).title(title).build());
  }

  /**
   * Updates the status text and advances the progress.
   *
   * <p>The fraction is ignored if {@link LongTask#withProgressBar()} was not called (the task stays
   * indeterminate).
   *
   * @param text new status message
   * @param progress value between {@code 0.0} and {@code 1.0}
   */
  public Object step(String text, double progress) {
    return update(
        p -> {
          var next = p.toBuilder().text(text);
          if (progressBar) next.fraction(clamp(progress));
          return next.build();
        });
  }

  /**
   * Updates the status text, the title and the progress.
   *
   * <p>The fraction is ignored if {@link LongTask#withProgressBar()} was not called.
   *
   * @param text new status message
   * @param title new title
   * @param progress value between {@code 0.0} and {@code 1.0}
   */
  public Object step(String text, String title, double progress) {
    return update(
        p -> {
          var next = p.toBuilder().text(text).title(title);
          if (progressBar) next.fraction(clamp(progress));
          return next.build();
        });
  }

  /**
   * Updates the status text with a count of the work ("12 of 300"): the task becomes determinate
   * ({@code done / total}) whether or not {@link LongTask#withProgressBar()} was called — a count
   * is the most honest progress there is.
   *
   * @param text new status message
   * @param done items done so far
   * @param total items in all (0 or less: the count is unknown, the task stays as it was)
   */
  @Experimental("progress and notifications patterns (3.0)")
  public Object step(String text, int done, int total) {
    return update(
        p -> {
          var next = p.toBuilder().text(text);
          if (total > 0) {
            next.done(done).total(total).fraction(clamp(done / (double) total));
          }
          return next.build();
        });
  }

  private static double clamp(double value) {
    return Double.isNaN(value) ? 0 : Math.max(0, Math.min(1, value));
  }
}
