package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.ProgressDto;
import io.mateu.dtos.ProgressStateDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * What a {@link LongTask}'s stream carries: a {@code Progress} command per update with the WHOLE
 * state of the task, and the fraction only moves when the task asked for a bar (or counts).
 */
class LongTaskProgressTest {

  private static List<ProgressDto> stream(LongTask task) {
    return task
        .run(
            progress ->
                Flux.just(
                    progress.step("one"),
                    progress.step("two", "Importing"),
                    progress.step("three", 0.5),
                    progress.step("four", "Almost", 0.9)))
        .collectList()
        .block()
        .stream()
        .map(LongTaskProgressTest::progressOf)
        .toList();
  }

  private static ProgressDto progressOf(Object item) {
    assertThat(item).isInstanceOf(UIIncrementDto.class);
    var command = ((UIIncrementDto) item).commands().get(0);
    assertThat(command.type()).isEqualTo(UICommandTypeDto.Progress);
    return (ProgressDto) command.data();
  }

  @Test
  void eachStepIsTheWholeStateOfTheSameTask() {
    var items = stream(LongTask.create("Import").withProgressBar());

    assertThat(items).hasSize(6);
    assertThat(items).extracting(ProgressDto::taskId).containsOnly(items.get(0).taskId());
    assertThat(items.get(1).text()).isEqualTo("one");
    assertThat(items.get(1).title()).isEqualTo("Import");
    assertThat(items.get(2).title()).isEqualTo("Importing");
    assertThat(items.get(3).fraction()).isEqualTo(0.5);
    assertThat(items.get(3).title()).isEqualTo("Importing");
    assertThat(items.get(4).fraction()).isEqualTo(0.9);
    assertThat(items.get(5).state()).isEqualTo(ProgressStateDto.done);
    assertThat(items.get(5).fraction()).isEqualTo(1.0);
  }

  @Test
  void withoutAProgressBarTheTaskStaysIndeterminate() {
    var items = stream(LongTask.create("Import"));

    assertThat(items).extracting(ProgressDto::fraction).containsOnlyNulls();
  }

  @Test
  void aCountMakesItDeterminate() {
    var items =
        LongTask.create("Import")
            .run(progress -> Flux.just(progress.step("12 rows", 12, 300)))
            .collectList()
            .block()
            .stream()
            .map(LongTaskProgressTest::progressOf)
            .toList();

    assertThat(items.get(1).done()).isEqualTo(12);
    assertThat(items.get(1).total()).isEqualTo(300);
    assertThat(items.get(1).fraction()).isEqualTo(0.04);
    assertThat(items.get(2).done()).isEqualTo(300);
    assertThat(items.get(2).fraction()).isEqualTo(1.0);
  }
}
