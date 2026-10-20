package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only horizontal progress indicator: a row of numbered {@link Step}s connected by a line,
 * showing where a multi-step process stands. Unlike a {@code Wizard}, this only VISUALIZES progress
 * — it drives no navigation. Design-system neutral, dark-mode aware.
 *
 * @param resultTitle the title of the screen that follows the last step — a wizard's result step —
 *     which is not a step of the process and so is not in {@code steps}. A renderer that shows the
 *     finished process as one more screen (Redwood's guided process) titles it with this instead of
 *     inventing one; {@code null} when there is no such screen.
 */
@Builder
public record ProgressSteps(
    String id,
    List<Step> steps,
    boolean vertical,
    String style,
    String cssClasses,
    String resultTitle)
    implements Component {

  /** Without a result title (the shape before it existed). */
  public ProgressSteps(
      String id, List<Step> steps, boolean vertical, String style, String cssClasses) {
    this(id, steps, vertical, style, cssClasses, null);
  }
}
