package io.mateu.uidl.data;

import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import reactor.core.publisher.Flux;

/**
 * Fluent builder for long-running operations that stream progress to the UI via SSE.
 *
 * <p>{@code LongTask} opens a modal progress dialog when the action starts, keeps it updated as the
 * underlying {@link Flux} emits items, and optionally closes it or runs follow-up commands when the
 * flux completes. Internally it composes a {@code Flux.concat} of three segments:
 *
 * <ol>
 *   <li><b>Opening event</b> — sends a {@link Dialog} component to the frontend, creating the
 *       progress dialog with an initial title and status text.
 *   <li><b>Work flux</b> — the caller's flux, whose items must be produced via {@link
 *       ProgressReporter#step}. Each step updates the dialog text (and optionally the progress bar
 *       value) in real time.
 *   <li><b>Closing event</b> — updates the dialog to its final state, then dispatches any
 *       configured {@link UICommand}s and schedules auto-close if requested.
 * </ol>
 *
 * <h3>Minimal usage</h3>
 *
 * <pre>{@code
 * @Button
 * @Action(validationRequired = false)
 * public Flux<?> importData() {
 *     return LongTask.create("Importing data...")
 *             .done("Done", "Import complete")
 *             .run(progress -> importService.rows()
 *                     .map(row -> progress.step("Imported: " + row.name())));
 * }
 * }</pre>
 *
 * <h3>With progress bar, auto-close, and navigation</h3>
 *
 * <pre>{@code
 * return LongTask.create("Importing data...")
 *         .withProgressBar()
 *         .done("Done", "Import complete")
 *         .closeAfter(2)
 *         .withCommand(UICommand.navigateTo("/results"))
 *         .run(progress -> importService.rows()
 *                 .map(row -> progress.step(
 *                         "Imported: " + row.name(),
 *                         row.index() / (double) row.total())));
 * }</pre>
 *
 * @see ProgressReporter
 * @see UICommand
 */
public class LongTask {

  static final String PROGRESS_VALUE_KEY = "progressValue";

  private final String title;
  private String doneTitle;
  private String doneText;
  private boolean progressBar;
  private int closeAfterSeconds;
  private final List<UICommand> onDoneCommands = new ArrayList<>();

  private LongTask(String title) {
    this.title = title;
  }

  /**
   * Creates a new {@code LongTask} with the given dialog title.
   *
   * <p>The title is shown in the dialog header while the task is running. It can be changed during
   * execution via {@link ProgressReporter#step(String, String)} or {@link
   * ProgressReporter#step(String, String, double)}.
   *
   * @param title initial title displayed in the progress dialog header
   */
  public static LongTask create(String title) {
    return new LongTask(title);
  }

  /**
   * Sets the title and body text shown in the dialog once the flux completes.
   *
   * <p>Both values are optional. If omitted, the dialog retains whatever text was set by the last
   * {@link ProgressReporter#step} call.
   *
   * @param doneTitle header text to display on completion
   * @param doneText body text to display on completion
   */
  public LongTask done(String doneTitle, String doneText) {
    this.doneTitle = doneTitle;
    this.doneText = doneText;
    return this;
  }

  /**
   * Adds a determinate progress bar to the dialog.
   *
   * <p>When enabled, pass a {@code double} between {@code 0.0} and {@code 1.0} as the second
   * argument to {@link ProgressReporter#step(String, double)} to advance the bar. The bar
   * automatically fills to {@code 1.0} when the flux completes.
   */
  public LongTask withProgressBar() {
    this.progressBar = true;
    return this;
  }

  /**
   * Automatically closes the progress dialog a given number of seconds after the task completes.
   *
   * <p>Call this before {@link #run} to let the dialog disappear on its own instead of requiring
   * the user to close it manually. Useful for fire-and-forget operations where the final state
   * message is informational and the user does not need to act on it.
   *
   * <pre>{@code
   * LongTask.create("Importing data...")
   *         .withProgressBar()
   *         .done("Done", "Import complete")
   *         .closeAfter(3)   // dialog closes 3 s after the flux completes
   *         .run(progress -> ...);
   * }</pre>
   *
   * @param seconds seconds to wait after completion before closing the dialog; must be positive
   */
  public LongTask closeAfter(int seconds) {
    this.closeAfterSeconds = seconds;
    return this;
  }

  /**
   * Executes one or more {@link UICommand}s when the task completes, immediately after updating the
   * dialog's final state.
   *
   * <p>Useful for side-effects that should happen once the job finishes: navigating to a results
   * page, pushing a history entry, dispatching a custom event, or triggering another action.
   * Commands are dispatched to the progress dialog element itself, so they are processed even if
   * the surrounding page has changed. Combine freely with {@link #closeAfter}:
   *
   * <pre>{@code
   * LongTask.create("Importing data...")
   *         .withProgressBar()
   *         .done("Done", "Import complete")
   *         .closeAfter(2)
   *         .withCommand(UICommand.navigateTo("/results"))
   *         .run(progress -> ...);
   * }</pre>
   *
   * <p><b>Notes:</b>
   *
   * <ul>
   *   <li>{@code navigateTo}, {@code pushStateToHistory} and {@code dispatchEvent} work from any
   *       element and are always safe here.
   *   <li>{@code runAction} works when the command includes an explicit {@code targetComponentId}
   *       (use {@link UICommand#runAction(String, String)}).
   *   <li>{@code closeModal} is not needed here — use {@link #closeAfter(int)} instead.
   * </ul>
   *
   * @param commands one or more commands to dispatch on completion
   */
  public LongTask withCommand(UICommand... commands) {
    onDoneCommands.addAll(List.of(commands));
    return this;
  }

  /**
   * Runs the task and returns the SSE flux to be returned from the {@code @Button} method.
   *
   * <p>The provided {@code work} function receives a {@link ProgressReporter} and must return a
   * {@link Flux} whose items are produced via {@code progress.step(...)}. The returned flux is
   * concatenated between the dialog-opening and dialog-closing events, so items are streamed to the
   * client in real time as the underlying flux emits them.
   *
   * <pre>{@code
   * .run(progress -> Flux.range(1, total)
   *         .map(i -> progress.step("Processing " + i, i / (double) total)))
   * }</pre>
   *
   * @param work function that receives a {@link ProgressReporter} and returns the work flux
   * @return a flux to be returned directly from a {@code @Button} method
   */
  public Flux<?> run(Function<ProgressReporter, Flux<?>> work) {
    String id = UUID.randomUUID().toString();
    ProgressReporter reporter = new ProgressReporter(id, progressBar);

    return Flux.concat(Flux.just(openingDialog(id)), work.apply(reporter), closingFlux(id));
  }

  private Object openingDialog(String id) {
    Map<String, Object> initialData = new HashMap<>();
    initialData.put("progressText", "Iniciando...");
    initialData.put("title", title != null ? title : "");
    if (progressBar) {
      initialData.put(PROGRESS_VALUE_KEY, 0.0);
    }

    Object content =
        progressBar
            ? VerticalLayout.builder()
                .content(
                    List.of(
                        new Text("${state.progressText}"),
                        ProgressBar.builder()
                            .valueKey(PROGRESS_VALUE_KEY)
                            .style("width: 100%;")
                            .build()))
                .style("width: 100%;")
                .build()
            : new Text("${state.progressText}");

    return Dialog.builder()
        .id(id)
        .headerTitle("${state.title}")
        .content((io.mateu.uidl.fluent.Component) content)
        .closeButtonOnHeader(true)
        .initialData(initialData)
        .build();
  }

  private Flux<?> closingFlux(String id) {
    Map<String, Object> state = new HashMap<>();
    if (doneText != null) state.put("progressText", doneText);
    if (doneTitle != null) state.put("title", doneTitle);
    if (progressBar) state.put(PROGRESS_VALUE_KEY, 1.0);
    if (closeAfterSeconds > 0) state.put("_closeAfterMillis", closeAfterSeconds * 1000);

    List<UICommandDto> commandDtos =
        onDoneCommands.stream()
            .map(
                cmd ->
                    new UICommandDto(id, UICommandTypeDto.valueOf(cmd.type().name()), cmd.data()))
            .toList();

    if (state.isEmpty() && commandDtos.isEmpty()) return Flux.empty();

    List<UIFragmentDto> fragments =
        state.isEmpty()
            ? List.of()
            : List.of(UIFragmentDto.builder().targetComponentId(id).state(state).build());

    return Flux.just(
        new UIIncrementDto(commandDtos, List.of(), fragments, List.of(), false, null, null));
  }
}
