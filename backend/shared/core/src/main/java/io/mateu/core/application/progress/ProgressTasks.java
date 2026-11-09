package io.mateu.core.application.progress;

import io.mateu.dtos.MessageDto;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.LongSupplier;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

/**
 * The running tasks of this process — what lets a user CANCEL one ({@value #CANCEL_ACTION}), pick
 * it up again after a reload ({@value #TASKS_ACTION}, {@value #RESUME_ACTION}), and what makes
 * every task end with a terminal {@code Progress}, whatever stopped it.
 *
 * <p>{@link #track} wraps every answer stream of {@code RunActionUseCase}: a {@code Progress}
 * command in state running registers its task (owner = the caller, hashed: the identity the host
 * framework authenticated, every grant included); a terminal one marks it finished. When the stream
 * ends with tasks still running it closes them — {@code cancelled} after a cancel, else {@code
 * failed} with the error message the stream carried (the error boundary's text, never a raw
 * exception). Each running {@code Progress} gets the server's {@link EtaEstimator estimate} of the
 * time left ({@code etaSeconds}).
 *
 * <p>The work of a stream runs ONCE, subscribed here, and its increments are handed to every
 * subscriber of the task: the stream that started it and any {@link #resume} stream. When the last
 * subscriber goes away while a task runs (a reload, a closed tab, a dropped connection), the task
 * runs on for the REATTACH GRACE PERIOD ({@value #GRACE_PROPERTY}, default {@value
 * #DEFAULT_GRACE_SECONDS} s; 0 = cancel at once, the behaviour before 3.0-rc): a resume in time
 * keeps it going, else it is cancelled ({@code onCancel} runs). A stream that reports no task keeps
 * the old behaviour: closing it disposes the work at once. A finished task is remembered for the
 * same period (its terminal {@code Progress} and the messages of its terminal increment), so a tab
 * that reloads just as it ends still learns how it ended.
 *
 * <p>{@link #cancel}, {@link #tasks} and {@link #resume} reach tasks of THE SAME CALLER only;
 * anything else answers nothing, so a foreign task cannot even be told apart from an unknown one.
 * Anonymous callers share one identity, so for them the random task id is the capability. Bounded
 * ({@value #MAX_TASKS}, oldest first) and in-process: in a cluster a cancel or a resume must reach
 * the node running the task (sticky sessions).
 */
public final class ProgressTasks {

  /** The reserved action a renderer sends, with parameter {@code taskId}, to cancel a task. */
  public static final String CANCEL_ACTION = "_progress-cancel";

  /**
   * The reserved action a renderer sends on boot, with parameter {@code taskIds}, to learn which of
   * the tasks it remembers are still running (or finished meanwhile).
   */
  public static final String TASKS_ACTION = "_progress-tasks";

  /**
   * The reserved action a renderer sends over the SSE endpoint, with parameter {@code taskId}, to
   * follow a task again (its current state, then its updates until it ends).
   */
  public static final String RESUME_ACTION = "_progress-resume";

  /** The reattach grace period, in seconds (0 = closing the last stream cancels the task). */
  public static final String GRACE_PROPERTY = "mateu.progress.reattach-grace-seconds";

  static final int DEFAULT_GRACE_SECONDS = 60;

  static final int MAX_TASKS = 10_000;

  /** How many ids one {@value #TASKS_ACTION} looks at. */
  static final int MAX_LISTED = 50;

  /** The clock the ETA and the retention read (a test moves it). */
  static volatile LongSupplier clock = System::currentTimeMillis;

  /** One stream that reports tasks: the work, run once, and who is listening to it. */
  private static final class Run {
    final Sinks.Empty<Void> stop = Sinks.empty();
    final AtomicBoolean cancelled = new AtomicBoolean();
    final Sinks.Many<UIIncrementDto> resumes = Sinks.many().multicast().directBestEffort();
    final Map<String, Entry> open = new LinkedHashMap<>();
    final Map<String, EtaEstimator> etas = new LinkedHashMap<>();
    volatile String owner;
    volatile String lastError;
    int subscribers = 1;
    boolean finished;
    Disposable work;
    Disposable graceTimer;
  }

  /** One task: its run, its latest state, and — once finished — until when it is remembered. */
  private static final class Entry {
    final String owner;
    final Run run;
    volatile ProgressDto last;
    volatile List<MessageDto> terminalMessages = List.of();
    volatile long expiresAt;

    Entry(String owner, Run run, ProgressDto last) {
      this.owner = owner;
      this.run = run;
      this.last = last;
    }

    boolean finished() {
      return expiresAt > 0;
    }
  }

  private static final Map<String, Entry> TASKS =
      new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Entry> eldest) {
          return size() > MAX_TASKS;
        }
      };

  private static long lastPurge;

  private ProgressTasks() {}

  /** The reattach grace period, in milliseconds (never negative). */
  static long graceMillis() {
    var value = io.mateu.core.infra.MateuSettings.get(GRACE_PROPERTY);
    if (value == null) {
      return DEFAULT_GRACE_SECONDS * 1000L;
    }
    try {
      return Math.max(0, Math.round(Double.parseDouble(value) * 1000));
    } catch (NumberFormatException e) {
      return DEFAULT_GRACE_SECONDS * 1000L;
    }
  }

  /** The answer stream {@code source}, its tasks registered while they run and always closed. */
  public static Flux<UIIncrementDto> track(Flux<UIIncrementDto> source, HttpRequest httpRequest) {
    return Flux.deferContextual(
        context -> {
          var run = new Run();
          var primary = Sinks.many().unicast().<UIIncrementDto>onBackpressureBuffer();
          var observed =
              source
                  .map(increment -> observe(increment, run, httpRequest))
                  .takeUntilOther(run.stop.asMono())
                  .concatWith(Flux.defer(() -> closing(run)))
                  .doFinally(signal -> finish(run))
                  // the caller's Reactor context (a reactive security context…) still reaches the
                  // work, although it is subscribed here and not by the caller
                  .contextWrite(context);
          // the work runs once, here: its increments go to the stream that started it and to any
          // resume stream of its tasks — so it can outlive the first one (a reload)
          run.work =
              observed.subscribe(
                  increment -> {
                    primary.tryEmitNext(increment);
                    run.resumes.tryEmitNext(increment);
                  },
                  error -> {
                    primary.tryEmitError(error);
                    run.resumes.tryEmitComplete();
                  },
                  () -> {
                    primary.tryEmitComplete();
                    run.resumes.tryEmitComplete();
                  });
          return primary.asFlux().doOnCancel(() -> subscriberLeft(run));
        });
  }

  /**
   * Cancels the caller's task {@code taskId}: its stream stops (the work is disposed, {@code
   * onCancel} runs) and ends {@code cancelled}. Answers that cancelled state too — or nothing, when
   * there is no such running task of this caller.
   */
  public static Flux<UIIncrementDto> cancel(String taskId, HttpRequest httpRequest) {
    var entry = ownEntry(taskId, httpRequest);
    if (entry == null || entry.finished()) {
      return Flux.just(emptyIncrement());
    }
    entry.run.cancelled.set(true);
    entry.run.stop.tryEmitEmpty();
    return Flux.just(
        increment(List.of(command(terminal(entry.last, ProgressStateDto.cancelled, null)))));
  }

  /**
   * The current state of each of {@code taskIds} that is a task of the caller, running or finished
   * within the grace period — one {@code Progress} command each, in the order asked. Unknown,
   * expired and foreign ids are absent (indistinguishable). At most {@value #MAX_LISTED} looked at.
   */
  public static Flux<UIIncrementDto> tasks(Collection<String> taskIds, HttpRequest httpRequest) {
    var commands = new ArrayList<UICommandDto>();
    if (taskIds != null && !taskIds.isEmpty()) {
      var owner = ownerOf(httpRequest);
      taskIds.stream()
          .limit(MAX_LISTED)
          .distinct()
          .forEach(
              id -> {
                var entry = entry(id);
                if (entry != null && entry.owner.equals(owner)) {
                  commands.add(command(entry.last));
                }
              });
    }
    return Flux.just(increment(commands));
  }

  /**
   * Follows the caller's task {@code taskId} again: one increment with its current {@code
   * Progress}, then the task's later increments reduced to their page-level parts ({@code Progress}
   * and {@code NotificationsChanged} commands, messages — the rest was for the screen that started
   * it), ending after its terminal {@code Progress}. A finished task: its terminal state and the
   * messages it ended with. Unknown or foreign: an empty stream.
   */
  public static Flux<UIIncrementDto> resume(String taskId, HttpRequest httpRequest) {
    return Flux.defer(
        () -> {
          var entry = ownEntry(taskId, httpRequest);
          if (entry == null) {
            return Flux.empty();
          }
          if (entry.finished()) {
            return Flux.just(terminalIncrement(entry));
          }
          var run = entry.run;
          if (!subscriberJoined(run)) {
            // it ended between the lookup and now
            return Flux.just(terminalIncrement(entry));
          }
          var ended = new AtomicBoolean();
          var updates =
              run.resumes
                  .asFlux()
                  .map(increment -> pageLevel(increment, taskId))
                  .filter(increment -> increment != null)
                  .doOnNext(
                      increment -> {
                        if (endsTask(increment, taskId)) {
                          ended.set(true);
                        }
                      })
                  .takeUntil(increment -> endsTask(increment, taskId));
          return Flux.concat(
                  Flux.just(increment(List.of(command(entry.last)))),
                  updates,
                  // a terminal state that slipped between the first increment and the
                  // subscription is still told
                  Flux.defer(
                      () ->
                          !ended.get() && entry.finished()
                              ? Flux.just(terminalIncrement(entry))
                              : Flux.empty()))
              .doFinally(signal -> subscriberLeft(run));
        });
  }

  /** Whether {@code taskId} is running in this process (for tests and diagnostics). */
  public static boolean isRunning(String taskId) {
    var entry = entry(taskId);
    return entry != null && !entry.finished();
  }

  // ── subscribers and the grace period ───────────────────────────────────────

  private static boolean subscriberJoined(Run run) {
    synchronized (run) {
      if (run.finished) {
        return false;
      }
      run.subscribers++;
      if (run.graceTimer != null) {
        run.graceTimer.dispose();
        run.graceTimer = null;
      }
      return true;
    }
  }

  private static void subscriberLeft(Run run) {
    synchronized (run) {
      run.subscribers--;
      if (run.subscribers > 0 || run.finished) {
        return;
      }
      boolean reportsTask;
      synchronized (TASKS) {
        reportsTask = !run.open.isEmpty();
      }
      if (!reportsTask) {
        // nobody listens and there is no task to keep: the work stops, as it always did
        if (run.work != null) {
          run.work.dispose();
        }
        return;
      }
      var grace = graceMillis();
      if (grace <= 0) {
        stop(run);
        return;
      }
      if (run.graceTimer == null) {
        run.graceTimer = Mono.delay(Duration.ofMillis(grace)).subscribe(tick -> graceOver(run));
      }
    }
  }

  private static void graceOver(Run run) {
    synchronized (run) {
      run.graceTimer = null;
      if (run.subscribers > 0 || run.finished) {
        return;
      }
    }
    stop(run);
  }

  private static void stop(Run run) {
    run.cancelled.set(true);
    run.stop.tryEmitEmpty();
  }

  // ── what the stream says ───────────────────────────────────────────────────

  private static UIIncrementDto observe(
      UIIncrementDto increment, Run run, HttpRequest httpRequest) {
    for (MessageDto message : increment.messages()) {
      if (message.variant() == NotificationVariantDto.error) {
        run.lastError = message.text();
      }
    }
    boolean changed = false;
    var commands = new ArrayList<UICommandDto>(increment.commands().size());
    for (var command : increment.commands()) {
      if (command.type() == UICommandTypeDto.Progress && command.data() instanceof ProgressDto p) {
        var progress = withEta(translateStartingText(p, httpRequest), run);
        if (progress != p) {
          changed = true;
          command = new UICommandDto(command.targetComponentId(), command.type(), progress);
        }
        if (progress.state() == ProgressStateDto.running) {
          if (run.owner == null) {
            run.owner = ownerOf(httpRequest);
          }
          synchronized (TASKS) {
            var entry = run.open.get(progress.taskId());
            if (entry == null) {
              entry = new Entry(run.owner, run, progress);
              run.open.put(progress.taskId(), entry);
              TASKS.putIfAbsent(progress.taskId(), entry);
            }
            entry.last = progress;
          }
        } else {
          finished(run, progress, increment.messages());
        }
      }
      commands.add(command);
    }
    return changed ? withCommands(increment, commands) : increment;
  }

  /** The running {@code progress} with the server's estimate of the time left. */
  private static ProgressDto withEta(ProgressDto progress, Run run) {
    if (progress.taskId() == null) {
      return progress;
    }
    Integer eta;
    synchronized (run.etas) {
      if (progress.state() != ProgressStateDto.running) {
        run.etas.remove(progress.taskId());
        eta = null;
      } else {
        eta =
            run.etas
                .computeIfAbsent(progress.taskId(), id -> new EtaEstimator())
                .observe(progress, clock.getAsLong());
      }
    }
    return java.util.Objects.equals(eta, progress.etaSeconds())
        ? progress
        : progress.toBuilder().etaSeconds(eta).build();
  }

  /** A task reached its terminal state: remembered for the grace period, then forgotten. */
  private static void finished(Run run, ProgressDto terminal, List<MessageDto> messages) {
    var grace = graceMillis();
    synchronized (TASKS) {
      var entry = run.open.remove(terminal.taskId());
      if (entry == null) {
        entry = TASKS.get(terminal.taskId());
        if (entry == null || entry.run != run) {
          return;
        }
      }
      entry.last = terminal;
      entry.terminalMessages = messages != null ? List.copyOf(messages) : List.of();
      if (grace <= 0) {
        TASKS.remove(terminal.taskId());
      } else {
        entry.expiresAt = clock.getAsLong() + grace;
      }
    }
  }

  private static Flux<UIIncrementDto> closing(Run run) {
    List<Entry> open;
    synchronized (TASKS) {
      open = new ArrayList<>(run.open.values());
    }
    if (open.isEmpty()) {
      return Flux.empty();
    }
    var cancelled = run.cancelled.get();
    var commands = new ArrayList<UICommandDto>();
    for (var entry : open) {
      var terminal =
          cancelled
              ? terminal(entry.last, ProgressStateDto.cancelled, null)
              : terminal(entry.last, ProgressStateDto.failed, run.lastError);
      finished(run, terminal, List.of());
      commands.add(command(terminal));
    }
    return Flux.just(increment(commands));
  }

  private static void finish(Run run) {
    synchronized (run) {
      run.finished = true;
      if (run.graceTimer != null) {
        run.graceTimer.dispose();
        run.graceTimer = null;
      }
    }
    synchronized (TASKS) {
      // disposed without its closing increment: nobody is told, nothing is remembered
      run.open.keySet().forEach(TASKS::remove);
      run.open.clear();
    }
  }

  // ── the registry ───────────────────────────────────────────────────────────

  private static Entry ownEntry(String taskId, HttpRequest httpRequest) {
    var entry = entry(taskId);
    return entry != null && entry.owner.equals(ownerOf(httpRequest)) ? entry : null;
  }

  /** The task {@code taskId}, running or finished within the grace period. */
  private static Entry entry(String taskId) {
    if (taskId == null) {
      return null;
    }
    synchronized (TASKS) {
      purge();
      var entry = TASKS.get(taskId);
      if (entry != null && entry.finished() && entry.expiresAt <= clock.getAsLong()) {
        TASKS.remove(taskId);
        return null;
      }
      return entry;
    }
  }

  /** Forgets the finished tasks whose grace period is over (at most once a second). */
  private static void purge() {
    var now = clock.getAsLong();
    if (now - lastPurge < 1000 && now >= lastPurge) {
      return;
    }
    lastPurge = now;
    TASKS.values().removeIf(e -> e.finished() && e.expiresAt <= now);
  }

  // ── increments ─────────────────────────────────────────────────────────────

  /** The page-level parts of {@code increment} for a resume of {@code taskId}; null = nothing. */
  private static UIIncrementDto pageLevel(UIIncrementDto increment, String taskId) {
    var commands =
        increment.commands().stream()
            .filter(
                c ->
                    (c.type() == UICommandTypeDto.Progress
                            && c.data() instanceof ProgressDto p
                            && taskId.equals(p.taskId()))
                        || c.type() == UICommandTypeDto.NotificationsChanged)
            .toList();
    if (commands.isEmpty() && increment.messages().isEmpty()) {
      return null;
    }
    return UIIncrementDto.builder()
        .commands(commands)
        .messages(increment.messages())
        .wireVersion(UIIncrementDto.WIRE_VERSION)
        .build();
  }

  private static boolean endsTask(UIIncrementDto increment, String taskId) {
    return increment.commands().stream()
        .anyMatch(
            c ->
                c.type() == UICommandTypeDto.Progress
                    && c.data() instanceof ProgressDto p
                    && taskId.equals(p.taskId())
                    && p.state() != ProgressStateDto.running);
  }

  private static UIIncrementDto terminalIncrement(Entry entry) {
    return UIIncrementDto.builder()
        .commands(List.of(command(entry.last)))
        .messages(entry.terminalMessages)
        .wireVersion(UIIncrementDto.WIRE_VERSION)
        .build();
  }

  private static ProgressDto translateStartingText(ProgressDto progress, HttpRequest httpRequest) {
    if (progress.state() == ProgressStateDto.running
        && LongTask.STARTING_TEXT.equals(progress.text())) {
      var text =
          io.mateu.core.infra.declarative.BuiltInTexts.translate(
              LongTask.STARTING_TEXT, httpRequest);
      if (!LongTask.STARTING_TEXT.equals(text)) {
        return progress.toBuilder().text(text).build();
      }
    }
    return progress;
  }

  private static ProgressDto terminal(ProgressDto last, ProgressStateDto state, String error) {
    return last.toBuilder()
        .state(state)
        .error(error)
        .etaSeconds(null)
        .backgroundable(false)
        .cancellable(false)
        .retryable(state == ProgressStateDto.failed && last.retryable())
        .build();
  }

  private static UICommandDto command(ProgressDto progress) {
    return new UICommandDto(null, UICommandTypeDto.Progress, progress);
  }

  private static UIIncrementDto emptyIncrement() {
    return UIIncrementDto.builder().wireVersion(UIIncrementDto.WIRE_VERSION).build();
  }

  private static UIIncrementDto increment(List<UICommandDto> commands) {
    return UIIncrementDto.builder()
        .commands(commands)
        .wireVersion(UIIncrementDto.WIRE_VERSION)
        .build();
  }

  private static UIIncrementDto withCommands(UIIncrementDto i, List<UICommandDto> commands) {
    return new UIIncrementDto(
        commands,
        i.messages(),
        i.fragments(),
        i.banners(),
        i.appendBanners(),
        i.appData(),
        i.appState(),
        i.wireVersion(),
        i.restSources(),
        i.fragmentCache());
  }

  /** The caller, hashed: the name and every grant of the identity the framework authenticated. */
  static String ownerOf(HttpRequest httpRequest) {
    var identity = io.mateu.core.infra.security.IdentityResolver.resolve(httpRequest);
    var caller =
        String.join(
            "\u0001",
            String.valueOf(identity.name()),
            sorted(identity.roles()),
            sorted(identity.groups()),
            sorted(identity.scopes()),
            sorted(identity.permissions()));
    try {
      return java.util.HexFormat.of()
          .formatHex(
              java.security.MessageDigest.getInstance("SHA-256")
                  .digest(caller.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    } catch (java.security.NoSuchAlgorithmException e) {
      return Integer.toHexString(caller.hashCode());
    }
  }

  private static String sorted(List<String> values) {
    return String.join(",", new java.util.TreeSet<>(values));
  }
}
