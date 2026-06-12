package io.mateu.uidl.data;

import io.mateu.dtos.UIFragmentDto;
import java.util.HashMap;
import java.util.Map;

/**
 * Sends incremental progress updates to the frontend dialog opened by {@link LongTask}.
 *
 * <p>An instance is provided by {@link LongTask#run}; callers should not construct it directly.
 * Each {@code step} method returns an object that must be emitted by the work flux — the return
 * value is the SSE payload, not a side-effect:
 *
 * <pre>{@code
 * .run(progress -> Flux.range(1, total)
 *         .map(i -> progress.step("Processed: " + i, i / (double) total)))
 * }</pre>
 */
public class ProgressReporter {

  private final String dialogId;
  private final boolean progressBar;

  ProgressReporter(String dialogId, boolean progressBar) {
    this.dialogId = dialogId;
    this.progressBar = progressBar;
  }

  /**
   * Updates the dialog body text.
   *
   * @param text new status message to display in the dialog
   */
  public Object step(String text) {
    return UIFragmentDto.builder()
        .targetComponentId(dialogId)
        .state(Map.of("progressText", text))
        .build();
  }

  /**
   * Updates both the dialog body text and the header title.
   *
   * @param text new status message
   * @param title new dialog header title
   */
  public Object step(String text, String title) {
    return UIFragmentDto.builder()
        .targetComponentId(dialogId)
        .state(Map.of("progressText", text, "title", title))
        .build();
  }

  /**
   * Updates the dialog body text and advances the progress bar.
   *
   * <p>Has no effect on the bar if {@link LongTask#withProgressBar()} was not called.
   *
   * @param text new status message
   * @param progress value between {@code 0.0} (empty) and {@code 1.0} (full)
   */
  public Object step(String text, double progress) {
    Map<String, Object> state = new HashMap<>();
    state.put("progressText", text);
    if (progressBar) state.put(LongTask.PROGRESS_VALUE_KEY, progress);
    return UIFragmentDto.builder().targetComponentId(dialogId).state(state).build();
  }

  /**
   * Updates the dialog body text, the header title, and the progress bar.
   *
   * <p>Has no effect on the bar if {@link LongTask#withProgressBar()} was not called.
   *
   * @param text new status message
   * @param title new dialog header title
   * @param progress value between {@code 0.0} (empty) and {@code 1.0} (full)
   */
  public Object step(String text, String title, double progress) {
    Map<String, Object> state = new HashMap<>();
    state.put("progressText", text);
    state.put("title", title);
    if (progressBar) state.put(LongTask.PROGRESS_VALUE_KEY, progress);
    return UIFragmentDto.builder().targetComponentId(dialogId).state(state).build();
  }
}
