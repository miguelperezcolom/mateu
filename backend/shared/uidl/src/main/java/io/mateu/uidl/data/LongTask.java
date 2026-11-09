package io.mateu.uidl.data;

import io.mateu.dtos.MessageActionDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.MessagePersistenceDto;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Experimental;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import reactor.core.publisher.Flux;

/**
 * Fluent builder for long-running operations that report their PROGRESS to the UI over SSE.
 *
 * <p>A {@code LongTask} is a task in the user's task center: it streams {@code Progress} commands
 * (title, status text, fraction or indeterminate, step count, state) and each renderer presents it
 * natively — a modal progress for a blocking task, its task center / the IDE's background-task
 * indicator for a background one. Several tasks can run at once; a task keeps running when the user
 * leaves the screen. The stream is:
 *
 * <ol>
 *   <li><b>Start</b> — the task, running, with its title and {@link #STARTING_TEXT}.
 *   <li><b>Work flux</b> — the caller's flux, whose items are produced by {@link
 *       ProgressReporter#step}: each one is the task's new state.
 *   <li><b>End</b> — the task, done (with {@link #done} texts and its {@link #resultAction}s), then
 *       the configured {@link UICommand}s. A failure ends it failed, a cancel cancelled — the
 *       framework sends those.
 * </ol>
 *
 * <h2>Minimal usage</h2>
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
 * <h2>A background task the user can cancel, with a result action</h2>
 *
 * <pre>{@code
 * return LongTask.create("Importing data...")
 *         .background()
 *         .cancellable()
 *         .retryable()
 *         .done("Import finished", "1,204 rows")
 *         .resultAction(MessageAction.open("Open report", "/imports/42"))
 *         .notifyWhenDone()
 *         .run(progress -> importService.rows()
 *                 .map(row -> progress.step("Imported: " + row.name(), row.index(), row.total())));
 * }</pre>
 *
 * @see ProgressReporter
 * @see UICommand
 */
public class LongTask {

  static final String PROGRESS_VALUE_KEY = "progressValue";

  /** The state key of the dialog's status line. */
  public static final String PROGRESS_TEXT_KEY = "progressText";

  /**
   * The status line the dialog opens with until the first step reports. English, and a key for the
   * app's {@code Translator}: the server translates it per request (an app with no translation for
   * it shows it as is), unless the task sets its own with {@link #startingText(String)}.
   */
  public static final String STARTING_TEXT = "Starting...";

  private final String title;
  private String doneTitle;
  private String doneText;
  private boolean progressBar;
  private int closeAfterSeconds;
  private String startingText = STARTING_TEXT;
  private final List<UICommand> onDoneCommands = new ArrayList<>();
  private boolean blocking = true;
  private boolean backgroundable;
  private boolean cancellable;
  private boolean retryable;
  private boolean notifyWhenDone;
  private Runnable onCancel;
  private final List<MessageAction> resultActions = new ArrayList<>();

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
   * The status line the dialog shows until the first step reports (default {@link #STARTING_TEXT},
   * translated by the app's {@code Translator}).
   *
   * @param text the opening status text
   * @return this builder
   */
  public LongTask startingText(String text) {
    this.startingText = text;
    return this;
  }

  /**
   * A BACKGROUND task: the user keeps working while it runs (it shows in the task center / the
   * IDE's background tasks, not in a modal). Without it a task is blocking, as it always was.
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask background() {
    this.blocking = false;
    return this;
  }

  /**
   * A blocking task the user may MOVE TO THE BACKGROUND from its modal (IntelliJ's "Background"
   * button): it then goes on in the task center.
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask backgroundable() {
    this.backgroundable = true;
    return this;
  }

  /**
   * The user may cancel the task: the renderer offers Cancel, which stops the work flux (Reactor
   * cancels it — write the work so that a cancel stops it) and ends the task {@code cancelled}.
   * Closing the stream (the user closes the tab) cancels it too, cancellable or not.
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask cancellable() {
    this.cancellable = true;
    return this;
  }

  /**
   * Runs {@code hook} when the task is cancelled — by the user, or because its stream closed (to
   * roll back what the work did, release a lock…). Implies {@link #cancellable()}.
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask onCancel(Runnable hook) {
    this.cancellable = true;
    this.onCancel = hook;
    return this;
  }

  /**
   * A failed run may be repeated: the renderer offers Retry, which runs the same action again (with
   * the same parameters).
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask retryable() {
    this.retryable = true;
    return this;
  }

  /**
   * What the user can do with the result once the task is done ("Open report", "View errors") —
   * shown by the finished task, and by its inbox entry ({@link #notifyWhenDone()}).
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask resultAction(MessageAction action) {
    this.resultActions.add(action);
    return this;
  }

  /**
   * Once done, the task also posts an entry to the user's notification inbox (a message with
   * persistence {@link MessagePersistence#inbox}: the done title/text and the result actions), so a
   * background task that finished while the user was elsewhere can be found later.
   */
  @Experimental("progress and notifications patterns (3.0)")
  public LongTask notifyWhenDone() {
    this.notifyWhenDone = true;
    return this;
  }

  /**
   * Runs the task and returns the SSE flux to be returned from the {@code @Button} method.
   *
   * <p>The provided {@code work} function receives a {@link ProgressReporter} and must return a
   * {@link Flux} whose items are produced via {@code progress.step(...)}. The returned flux is
   * concatenated between the task's start and its end, so its items are streamed to the client in
   * real time as the underlying flux emits them.
   *
   * <pre>{@code
   * .run(progress -> Flux.range(1, total)
   *         .map(i -> progress.step("Processing " + i, i, total)))
   * }</pre>
   *
   * @param work function that receives a {@link ProgressReporter} and returns the work flux
   * @return a flux to be returned directly from a {@code @Button} method
   */
  public Flux<?> run(Function<ProgressReporter, Flux<?>> work) {
    return Flux.defer(
        () -> {
          String id = UUID.randomUUID().toString();
          ProgressReporter reporter = new ProgressReporter(start(id), progressBar);
          Flux<?> body = work.apply(reporter);
          if (onCancel != null) {
            body = body.doOnCancel(onCancel);
          }
          return Flux.concat(
              Flux.just(ProgressReporter.increment(reporter.current())),
              body,
              Flux.defer(() -> Flux.just(end(reporter.current()))));
        });
  }

  private ProgressDto start(String id) {
    return ProgressDto.builder()
        .taskId(id)
        .title(title != null ? title : "")
        .text(startingText != null ? startingText : "")
        .fraction(progressBar ? 0.0 : null)
        .state(ProgressStateDto.running)
        .blocking(blocking)
        .backgroundable(blocking && backgroundable)
        .cancellable(cancellable)
        .retryable(retryable)
        .startedAt(System.currentTimeMillis())
        .build();
  }

  private UIIncrementDto end(ProgressDto last) {
    var done =
        last.toBuilder()
            .state(ProgressStateDto.done)
            .title(doneTitle != null ? doneTitle : last.title())
            .text(doneText != null ? doneText : last.text())
            .fraction(progressBar || last.fraction() != null ? Double.valueOf(1.0) : null)
            .done(last.total() != null ? last.total() : last.done())
            .closeAfterSeconds(closeAfterSeconds > 0 ? closeAfterSeconds : null)
            .resultActions(resultActions.stream().map(LongTask::toDto).toList())
            .build();
    List<UICommandDto> commands =
        onDoneCommands.stream()
            .map(
                cmd ->
                    new UICommandDto(null, UICommandTypeDto.valueOf(cmd.type().name()), cmd.data()))
            .toList();
    List<MessageDto> messages =
        notifyWhenDone
            ? List.of(
                MessageDto.builder()
                    .variant(NotificationVariantDto.success)
                    .title(done.title())
                    .text(done.text())
                    .duration(5000)
                    .persistence(MessagePersistenceDto.inbox)
                    .actions(done.resultActions())
                    .key("task-" + done.taskId())
                    .build())
            : List.of();
    return ProgressReporter.increment(done, commands, messages);
  }

  /** A {@link MessageAction} on the wire. */
  @io.mateu.uidl.annotations.Internal("wire mapping shared with the framework")
  public static MessageActionDto toDto(MessageAction action) {
    return new MessageActionDto(
        action.label(), action.actionId(), action.parameters(), action.route(), action.style());
  }
}
