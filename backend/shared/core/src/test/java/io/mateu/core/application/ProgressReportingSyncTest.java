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
  void closingTheStreamCancelsTheWork() throws Exception {
    CANCELLED.set(false);
    var seen = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("endless")).doOnNext(seen::add).subscribe();
    var taskId = waitForTask(seen);
    subscription.dispose();
    assertThat(CANCELLED).isTrue();
    assertThat(ProgressTasks.isRunning(taskId)).isFalse();
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
