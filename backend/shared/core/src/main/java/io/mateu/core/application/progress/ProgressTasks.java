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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * The running tasks of this process — what lets a user CANCEL one ({@value #CANCEL_ACTION}) and
 * what makes every task end with a terminal {@code Progress}, whatever stopped it.
 *
 * <p>{@link #track} wraps every answer stream of {@code RunActionUseCase}: a {@code Progress}
 * command in state running registers its task (owner = the caller, hashed: the identity the host
 * framework authenticated, every grant included); a terminal one unregisters it. When the stream
 * ends with tasks still running it closes them — {@code cancelled} after a cancel, else {@code
 * failed} with the error message the stream carried (the error boundary's text, never a raw
 * exception). Closing the stream (the browser goes away) disposes the work as Reactor always did.
 *
 * <p>{@link #cancel} stops a task of THE SAME CALLER only; anything else answers nothing, so a
 * foreign task cannot even be told apart from a finished one. Anonymous callers share one identity,
 * so for them the random task id is the capability. Bounded ({@value #MAX_TASKS}, oldest first) and
 * in-process: in a cluster a cancel must reach the node running the task (sticky sessions).
 */
public final class ProgressTasks {

  /** The reserved action a renderer sends, with parameter {@code taskId}, to cancel a task. */
  public static final String CANCEL_ACTION = "_progress-cancel";

  static final int MAX_TASKS = 10_000;

  private record Entry(
      String owner,
      Sinks.Empty<Void> stop,
      AtomicBoolean cancelled,
      AtomicReference<ProgressDto> last) {}

  private static final Map<String, Entry> TASKS =
      new LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Entry> eldest) {
          return size() > MAX_TASKS;
        }
      };

  private ProgressTasks() {}

  /** The answer stream {@code source}, its tasks registered while they run and always closed. */
  public static Flux<UIIncrementDto> track(Flux<UIIncrementDto> source, HttpRequest httpRequest) {
    return Flux.defer(
        () -> {
          // resolved only when the stream reports a task: most answers carry none, and an
          // identity lookup on every request would be paid for nothing (RequestBudgetTest)
          var owner = new AtomicReference<String>();
          var stop = Sinks.<Void>empty();
          var cancelled = new AtomicBoolean();
          var open = new LinkedHashMap<String, AtomicReference<ProgressDto>>();
          var lastError = new AtomicReference<String>();
          return source
              .map(
                  increment ->
                      observe(increment, owner, stop, cancelled, open, lastError, httpRequest))
              .takeUntilOther(stop.asMono())
              .concatWith(
                  Flux.defer(
                      () -> {
                        var closing = closing(open, cancelled.get(), lastError.get());
                        return closing == null ? Flux.empty() : Flux.just(closing);
                      }))
              .doFinally(
                  signal -> {
                    synchronized (TASKS) {
                      open.keySet().forEach(TASKS::remove);
                    }
                  });
        });
  }

  /**
   * Cancels the caller's task {@code taskId}: its stream stops (the work is disposed, {@code
   * onCancel} runs) and ends {@code cancelled}. Answers that cancelled state too — or nothing, when
   * there is no such task of this caller.
   */
  public static Flux<UIIncrementDto> cancel(String taskId, HttpRequest httpRequest) {
    Entry entry;
    synchronized (TASKS) {
      entry = taskId != null ? TASKS.get(taskId) : null;
    }
    if (entry == null || !entry.owner().equals(ownerOf(httpRequest))) {
      return Flux.just(UIIncrementDto.builder().wireVersion(UIIncrementDto.WIRE_VERSION).build());
    }
    entry.cancelled().set(true);
    entry.stop().tryEmitEmpty();
    var last = entry.last().get();
    return Flux.just(increment(List.of(command(terminal(last, ProgressStateDto.cancelled, null)))));
  }

  /** Whether {@code taskId} is running in this process (for tests and diagnostics). */
  public static boolean isRunning(String taskId) {
    synchronized (TASKS) {
      return TASKS.containsKey(taskId);
    }
  }

  private static UIIncrementDto observe(
      UIIncrementDto increment,
      AtomicReference<String> owner,
      Sinks.Empty<Void> stop,
      AtomicBoolean cancelled,
      Map<String, AtomicReference<ProgressDto>> open,
      AtomicReference<String> lastError,
      HttpRequest httpRequest) {
    for (MessageDto message : increment.messages()) {
      if (message.variant() == NotificationVariantDto.error) {
        lastError.set(message.text());
      }
    }
    boolean translated = false;
    var commands = new ArrayList<UICommandDto>(increment.commands().size());
    for (var command : increment.commands()) {
      if (command.type() == UICommandTypeDto.Progress && command.data() instanceof ProgressDto p) {
        var progress = translateStartingText(p, httpRequest);
        if (progress != p) {
          translated = true;
          command = new UICommandDto(command.targetComponentId(), command.type(), progress);
        }
        if (progress.state() == ProgressStateDto.running) {
          var last = open.computeIfAbsent(progress.taskId(), id -> new AtomicReference<>());
          last.set(progress);
          if (owner.get() == null) {
            owner.set(ownerOf(httpRequest));
          }
          synchronized (TASKS) {
            TASKS.putIfAbsent(progress.taskId(), new Entry(owner.get(), stop, cancelled, last));
          }
        } else {
          open.remove(progress.taskId());
          synchronized (TASKS) {
            TASKS.remove(progress.taskId());
          }
        }
      }
      commands.add(command);
    }
    return translated ? withCommands(increment, commands) : increment;
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

  private static UIIncrementDto closing(
      Map<String, AtomicReference<ProgressDto>> open, boolean cancelled, String error) {
    if (open.isEmpty()) {
      return null;
    }
    var commands = new ArrayList<UICommandDto>();
    for (var last : open.values()) {
      commands.add(
          command(
              cancelled
                  ? terminal(last.get(), ProgressStateDto.cancelled, null)
                  : terminal(last.get(), ProgressStateDto.failed, error)));
    }
    return increment(commands);
  }

  private static ProgressDto terminal(ProgressDto last, ProgressStateDto state, String error) {
    return last.toBuilder()
        .state(state)
        .error(error)
        .backgroundable(false)
        .cancellable(false)
        .retryable(state == ProgressStateDto.failed && last.retryable())
        .build();
  }

  private static UICommandDto command(ProgressDto progress) {
    return new UICommandDto(null, UICommandTypeDto.Progress, progress);
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
