package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.UIFragmentDto;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * What a {@link LongTask}'s work flux streams to its progress dialog: each {@code step} is a state
 * update aimed at that dialog, and the bar only moves when the task asked for one.
 */
class LongTaskProgressTest {

  private static List<?> stream(LongTask task) {
    return task.run(
            progress ->
                Flux.just(
                    progress.step("one"),
                    progress.step("two", "Importing"),
                    progress.step("three", 0.5),
                    progress.step("four", "Almost", 0.9)))
        .collectList()
        .block();
  }

  private static Object stateOf(Object item) {
    assertThat(item).isInstanceOf(UIFragmentDto.class);
    return ((UIFragmentDto) item).state();
  }

  @Test
  void eachStepUpdatesTheDialogItOpened() {
    var items = stream(LongTask.create("Import").withProgressBar());

    var dialog = (Dialog) items.get(0);
    for (var step : items.subList(1, 5)) {
      assertThat(((UIFragmentDto) step).targetComponentId()).isEqualTo(dialog.id());
    }
    assertThat(stateOf(items.get(1))).isEqualTo(Map.of("progressText", "one"));
    assertThat(stateOf(items.get(2)))
        .isEqualTo(Map.of("progressText", "two", "title", "Importing"));
    assertThat(stateOf(items.get(3)))
        .isEqualTo(Map.of("progressText", "three", LongTask.PROGRESS_VALUE_KEY, 0.5));
    assertThat(stateOf(items.get(4)))
        .isEqualTo(
            Map.of("progressText", "four", "title", "Almost", LongTask.PROGRESS_VALUE_KEY, 0.9));
  }

  @Test
  void withoutAProgressBarTheValueIsNotSent() {
    var items = stream(LongTask.create("Import"));

    assertThat(stateOf(items.get(3))).isEqualTo(Map.of("progressText", "three"));
    assertThat(stateOf(items.get(4))).isEqualTo(Map.of("progressText", "four", "title", "Almost"));
  }
}
