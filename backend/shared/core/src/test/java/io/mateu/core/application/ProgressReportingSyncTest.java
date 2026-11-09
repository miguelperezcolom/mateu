package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.progress.ProgressTasks;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessagePersistenceDto;
import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.MessageAction;
import io.mateu.uidl.data.UICommand;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * A {@link LongTask} reports its progress as {@code Progress} commands — the whole state of the
 * task each time, never a server-built dialog — and the framework makes it cancellable by its own
 * caller only, and always ends it (done, failed or cancelled).
 */
class ProgressReportingSyncTest {

  static final AtomicBoolean CANCELLED = new AtomicBoolean();

  @UI("/progress-reporting")
  public static class Jobs {

    @Button
    public Flux<?> importAll() {
      return LongTask.create("Importing")
          .withProgressBar()
          .done("Imported", "3 rows")
          .closeAfter(2)
          .withCommand(UICommand.navigateTo("/results"))
          .run(
              progress ->
                  Flux.range(1, 3)
                      .map(i -> i == 2 ? progress.step("Row 2", 2, 3) : progress.step("Row " + i)));
    }

    @Button
    public Flux<?> background() {
      return LongTask.create("Syncing")
          .background()
          .cancellable()
          .retryable()
          .resultAction(MessageAction.open("Open report", "/reports/1"))
          .notifyWhenDone()
          .run(progress -> Flux.range(1, 1).map(i -> progress.step("Row " + i)));
    }

    @Button
    public Flux<?> endless() {
      return LongTask.create("Endless")
          .onCancel(() -> CANCELLED.set(true))
          .run(
              progress ->
                  Flux.interval(Duration.ofMillis(20))
                      .map(i -> progress.step("tick " + i, (int) (long) i, 1000)));
    }

    @Button
    public Flux<?> broken() {
      return LongTask.create("Broken")
          .retryable()
          .run(
              progress ->
                  Flux.concat(
                      Flux.just(progress.step("Row 1")),
                      Flux.error(new io.mateu.uidl.UserFacingException("Row 2 is invalid"))));
    }

    @Button
    public Flux<?> crashing() {
      return LongTask.create("Crashing")
          .run(
              progress ->
                  Flux.concat(
                      Flux.just(progress.step("Row 1")),
                      Flux.error(
                          new IllegalStateException(
                              "jdbc:postgresql://db.internal/prod password=hunter2"))));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Jobs.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto rq(String actionId) {
    return RunActionRqDto.builder()
        .route("/progress-reporting")
        .actionId(actionId)
        .serverSideType(Jobs.class.getName())
        .build();
  }

  private static RunActionRqDto cancelRq(String taskId) {
    return RunActionRqDto.builder()
        .route("/progress-reporting")
        .actionId(ProgressTasks.CANCEL_ACTION)
        .serverSideType(Jobs.class.getName())
        .parameters(Map.of("taskId", taskId))
        .build();
  }

  private static List<ProgressDto> progressOf(List<UIIncrementDto> increments) {
    return increments.stream()
        .flatMap(i -> i.commands().stream())
        .filter(c -> c.type() == UICommandTypeDto.Progress)
        .map(c -> (ProgressDto) c.data())
        .toList();
  }

  @Test
  void aLongTaskStreamsTheWholeStateOfItsTaskAndNoDialog() {
    var increments = mateu.runAll(rq("importAll"));

    assertThat(increments).allSatisfy(i -> assertThat(i.fragments()).isEmpty());
    var progress = progressOf(increments);
    assertThat(progress).hasSize(5);
    assertThat(progress).extracting(ProgressDto::taskId).containsOnly(progress.get(0).taskId());

    var start = progress.get(0);
    assertThat(start.state()).isEqualTo(ProgressStateDto.running);
    assertThat(start.title()).isEqualTo("Importing");
    assertThat(start.text()).isEqualTo(LongTask.STARTING_TEXT);
    assertThat(start.fraction()).isEqualTo(0.0);
    assertThat(start.blocking()).isTrue();
    assertThat(start.cancellable()).isFalse();
    assertThat(start.startedAt()).isNotNull();

    var counted = progress.get(2);
    assertThat(counted.text()).isEqualTo("Row 2");
    assertThat(counted.done()).isEqualTo(2);
    assertThat(counted.total()).isEqualTo(3);
    assertThat(counted.fraction()).isCloseTo(2 / 3.0, org.assertj.core.data.Offset.offset(1e-9));
    // a later step keeps what an earlier one said (each command is self-contained)
    assertThat(progress.get(3).title()).isEqualTo("Importing");
    assertThat(progress.get(3).total()).isEqualTo(3);

    var done = progress.get(4);
    assertThat(done.state()).isEqualTo(ProgressStateDto.done);
    assertThat(done.title()).isEqualTo("Imported");
    assertThat(done.text()).isEqualTo("3 rows");
    assertThat(done.fraction()).isEqualTo(1.0);
    assertThat(done.closeAfterSeconds()).isEqualTo(2);
    // the done commands follow the done state, aimed at no dialog
    var last = increments.get(increments.size() - 1);
    assertThat(last.commands()).extracting(c -> c.type()).contains(UICommandTypeDto.NavigateTo);
    assertThat(last.commands()).allSatisfy(c -> assertThat(c.targetComponentId()).isNull());
    assertThat(ProgressTasks.isRunning(done.taskId())).isFalse();
  }

  @Test
  void aBackgroundTaskSaysSoAndPostsItsResultToTheInbox() {
    var increments = mateu.runAll(rq("background"));
    var progress = progressOf(increments);
    var start = progress.get(0);
    assertThat(start.blocking()).isFalse();
    assertThat(start.backgroundable()).isFalse();
    assertThat(start.cancellable()).isTrue();
    assertThat(start.retryable()).isTrue();
    assertThat(start.fraction()).isNull(); // indeterminate

    var done = progress.get(progress.size() - 1);
    assertThat(done.resultActions())
        .singleElement()
        .satisfies(
            a -> {
              assertThat(a.label()).isEqualTo("Open report");
              assertThat(a.route()).isEqualTo("/reports/1");
            });
    var message = increments.get(increments.size() - 1).messages();
    assertThat(message)
        .singleElement()
        .satisfies(
            m -> {
              assertThat(m.persistence()).isEqualTo(MessagePersistenceDto.inbox);
              assertThat(m.key()).isEqualTo("task-" + done.taskId());
              assertThat(m.actions()).hasSize(1);
            });
  }

  @Test
  void theCallerCancelsItsTaskAndTheWorkIsDisposed() throws Exception {
    CANCELLED.set(false);
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var all = mateu.stream(rq("endless")).doOnNext(seen::add).collectList().toFuture();

    var taskId = waitForTask(seen);
    assertThat(ProgressTasks.isRunning(taskId)).isTrue();

    var answer = mateu.run(cancelRq(taskId));
    assertThat(progressOf(List.of(answer)))
        .singleElement()
        .satisfies(p -> assertThat(p.state()).isEqualTo(ProgressStateDto.cancelled));

    var increments = all.get(5, TimeUnit.SECONDS);
    var last = progressOf(increments).get(progressOf(increments).size() - 1);
    assertThat(last.state()).isEqualTo(ProgressStateDto.cancelled);
    assertThat(last.cancellable()).isFalse();
    assertThat(CANCELLED).isTrue();
    assertThat(ProgressTasks.isRunning(taskId)).isFalse();
  }

  @Test
  void anotherCallerCannotCancelIt() throws Exception {
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
    try {
      var taskId = waitForTask(seen);

      var answer = mateu.run(cancelRq(taskId), TestIdentities.headersWithRoles("admin"));

      assertThat(answer.commands()).isEmpty();
      assertThat(ProgressTasks.isRunning(taskId)).isTrue();
      assertThat(mateu.run(cancelRq("no-such-task")).commands()).isEmpty();
    } finally {
      subscription.dispose();
    }
  }

  @Test
  void aTaskThatFailsEndsFailedWithTheMessageTheUserSees() {
    var increments = mateu.runAll(rq("broken"));
    var progress = progressOf(increments);
    var last = progress.get(progress.size() - 1);
    assertThat(last.state()).isEqualTo(ProgressStateDto.failed);
    assertThat(last.error()).isEqualTo("Row 2 is invalid");
    assertThat(last.retryable()).isTrue();
    assertThat(ProgressTasks.isRunning(last.taskId())).isFalse();
  }

  @Test
  void aTaskThatCrashesNeverStreamsTheRawException() {
    var increments = mateu.runAll(rq("crashing"));
    var progress = progressOf(increments);
    var last = progress.get(progress.size() - 1);
    assertThat(last.state()).isEqualTo(ProgressStateDto.failed);
    assertThat(last.error()).isNotBlank().doesNotContain("hunter2").doesNotContain("jdbc");
    assertThat(io.mateu.core.infra.JsonSerializer.toJson(increments))
        .doesNotContain("hunter2")
        .doesNotContain("IllegalStateException");
  }

  @Test
  void anAnonymousCallerCannotCancelAnAuthenticatedCallersTask() throws Exception {
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription =
        mateu.stream(rq("endless"), TestIdentities.headersWithRoles("user"))
            .doOnNext(seen::add)
            .subscribe();
    try {
      var taskId = waitForTask(seen);
      // the anonymous caller (no principal) holding the id, and the same user with other grants
      assertThat(mateu.run(cancelRq(taskId)).commands()).isEmpty();
      assertThat(
              mateu
                  .run(cancelRq(taskId), TestIdentities.headersWithRoles("user", "admin"))
                  .commands())
          .isEmpty();
      assertThat(ProgressTasks.isRunning(taskId)).isTrue();
      // a replayed cancel of a finished task answers nothing either
      assertThat(mateu.run(cancelRq(taskId), TestIdentities.headersWithRoles("user")).commands())
          .isNotEmpty();
      assertThat(mateu.run(cancelRq(taskId), TestIdentities.headersWithRoles("user")).commands())
          .isEmpty();
    } finally {
      subscription.dispose();
    }
  }

  @Test
  void withoutAGracePeriodClosingTheStreamCancelsTheWork() throws Exception {
    System.setProperty(ProgressTasks.GRACE_PROPERTY, "0");
    try {
      CANCELLED.set(false);
      var seen = new CopyOnWriteArrayList<UIIncrementDto>();
      var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
      var taskId = waitForTask(seen);
      subscription.dispose();
      assertThat(CANCELLED).isTrue();
      assertThat(ProgressTasks.isRunning(taskId)).isFalse();
    } finally {
      System.clearProperty(ProgressTasks.GRACE_PROPERTY);
    }
  }

  @Test
  void aCallerThatTakesOneIncrementAndLeavesCancelsTheTaskAtOnce() throws Exception {
    // the /sync leg: nothing can resume it, so there is nothing to wait a grace period for
    CANCELLED.set(false);
    var first = mateu.run(rq("endless"));
    var taskId = progressOf(List.of(first)).get(0).taskId();
    for (int i = 0; i < 100 && !CANCELLED.get(); i++) {
      Thread.sleep(20);
    }
    assertThat(CANCELLED).isTrue();
    assertThat(ProgressTasks.isRunning(taskId)).isFalse();
  }

  @Test
  void aClosedStreamLeavesTheTaskRunningAndAResumePicksItUp() throws Exception {
    CANCELLED.set(false);
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
    var taskId = waitForTask(seen);
    // the page reloads: its stream goes away, the task does not
    subscription.dispose();
    Thread.sleep(100);
    assertThat(CANCELLED).isFalse();
    assertThat(ProgressTasks.isRunning(taskId)).isTrue();

    // the reloaded page asks which of its tasks are still there…
    var listed = progressOf(List.of(mateu.run(tasksRq(List.of(taskId, "no-such-task")))));
    assertThat(listed)
        .singleElement()
        .satisfies(
            p -> {
              assertThat(p.taskId()).isEqualTo(taskId);
              assertThat(p.state()).isEqualTo(ProgressStateDto.running);
            });

    // …and follows it again: its current state first, then its updates, page-level parts only
    var resumed = new CopyOnWriteArrayList<UIIncrementDto>();
    var all = mateu.stream(resumeRq(taskId)).doOnNext(resumed::add).collectList().toFuture();
    for (int i = 0; i < 250 && progressOf(List.copyOf(resumed)).size() < 3; i++) {
      Thread.sleep(20);
    }
    assertThat(progressOf(List.copyOf(resumed))).hasSizeGreaterThanOrEqualTo(3);
    assertThat(resumed).allSatisfy(i -> assertThat(i.fragments()).isEmpty());
    assertThat(progressOf(List.copyOf(resumed))).allMatch(p -> taskId.equals(p.taskId()));

    // the resumed task can still be cancelled: the resume stream ends with it
    mateu.run(cancelRq(taskId));
    var increments = all.get(5, TimeUnit.SECONDS);
    var last = progressOf(increments).get(progressOf(increments).size() - 1);
    assertThat(last.state()).isEqualTo(ProgressStateDto.cancelled);
    assertThat(CANCELLED).isTrue();
  }

  @Test
  void aTaskNobodyResumesIsCancelledWhenTheGracePeriodIsOver() throws Exception {
    System.setProperty(ProgressTasks.GRACE_PROPERTY, "0.3");
    try {
      CANCELLED.set(false);
      var seen = new CopyOnWriteArrayList<UIIncrementDto>();
      var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
      var taskId = waitForTask(seen);
      subscription.dispose();
      Thread.sleep(50);
      assertThat(CANCELLED).isFalse();
      for (int i = 0; i < 100 && !CANCELLED.get(); i++) {
        Thread.sleep(20);
      }
      assertThat(CANCELLED).isTrue();
      assertThat(ProgressTasks.isRunning(taskId)).isFalse();
    } finally {
      System.clearProperty(ProgressTasks.GRACE_PROPERTY);
    }
  }

  @Test
  void aFinishedTaskStillTellsHowItEndedDuringTheGracePeriod() {
    var increments = mateu.runAll(rq("background"));
    var done = progressOf(increments).get(progressOf(increments).size() - 1);
    assertThat(done.state()).isEqualTo(ProgressStateDto.done);

    assertThat(progressOf(List.of(mateu.run(tasksRq(List.of(done.taskId()))))))
        .singleElement()
        .satisfies(p -> assertThat(p.state()).isEqualTo(ProgressStateDto.done));
    var resumed = mateu.stream(resumeRq(done.taskId())).collectList().block(Duration.ofSeconds(5));
    assertThat(resumed).hasSize(1);
    assertThat(progressOf(resumed))
        .singleElement()
        .satisfies(p -> assertThat(p.state()).isEqualTo(ProgressStateDto.done));
    // the inbox message it ended with (notifyWhenDone) comes along
    assertThat(resumed.get(0).messages())
        .singleElement()
        .satisfies(m -> assertThat(m.persistence()).isEqualTo(MessagePersistenceDto.inbox));
  }

  @Test
  void anotherCallerCannotListOrResumeATask() throws Exception {
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription =
        mateu.stream(rq("endless"), TestIdentities.headersWithRoles("user"))
            .doOnNext(seen::add)
            .subscribe();
    try {
      var taskId = waitForTask(seen);
      // the anonymous caller holding the id, and the same user with other grants: exactly what an
      // unknown id gets — nothing
      for (var headers :
          List.<Map<String, String>>of(
              Map.of(), TestIdentities.headersWithRoles("user", "admin"))) {
        assertThat(mateu.run(tasksRq(List.of(taskId)), headers).commands()).isEmpty();
        assertThat(
                mateu.stream(resumeRq(taskId), headers).collectList().block(Duration.ofSeconds(5)))
            .isEmpty();
      }
      assertThat(mateu.run(tasksRq(List.of("no-such-task"))).commands()).isEmpty();
      assertThat(mateu.stream(resumeRq("no-such-task")).collectList().block(Duration.ofSeconds(5)))
          .isEmpty();
      // its owner can
      assertThat(
              progressOf(
                  List.of(
                      mateu.run(
                          tasksRq(List.of(taskId)), TestIdentities.headersWithRoles("user")))))
          .hasSize(1);
      assertThat(ProgressTasks.isRunning(taskId)).isTrue();
    } finally {
      subscription.dispose();
      mateu.run(cancelRq(seen), TestIdentities.headersWithRoles("user"));
    }
  }

  @Test
  void aDeterminateTaskGetsAnEstimateOfTheTimeLeftOnceItIsHonest() throws Exception {
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
    try {
      var taskId = waitForTask(seen);
      // nothing in the first two seconds…
      var early = progressOf(List.copyOf(seen));
      assertThat(early.get(0).etaSeconds()).isNull();
      // …then an estimate (1000 steps of 20 ms: some seconds left)
      Integer eta = null;
      for (int i = 0; i < 250 && eta == null; i++) {
        Thread.sleep(20);
        var progress = progressOf(List.copyOf(seen));
        eta = progress.get(progress.size() - 1).etaSeconds();
      }
      assertThat(eta).isNotNull().isPositive();
      mateu.run(cancelRq(taskId));
    } finally {
      subscription.dispose();
    }
  }

  private static RunActionRqDto tasksRq(List<String> taskIds) {
    return RunActionRqDto.builder()
        .route("_no_route")
        .actionId(ProgressTasks.TASKS_ACTION)
        .parameters(Map.of("taskIds", taskIds))
        .build();
  }

  private static RunActionRqDto resumeRq(String taskId) {
    return RunActionRqDto.builder()
        .route("_no_route")
        .actionId(ProgressTasks.RESUME_ACTION)
        .parameters(Map.of("taskId", taskId))
        .build();
  }

  private static RunActionRqDto cancelRq(List<UIIncrementDto> seen) {
    return cancelRq(progressOf(List.copyOf(seen)).get(0).taskId());
  }

  private static String waitForTask(List<UIIncrementDto> seen) throws InterruptedException {
    for (int i = 0; i < 250; i++) {
      var progress = progressOf(List.copyOf(seen));
      if (progress.size() > 1) {
        return progress.get(0).taskId();
      }
      Thread.sleep(20);
    }
    throw new AssertionError("the task never started");
  }
}
