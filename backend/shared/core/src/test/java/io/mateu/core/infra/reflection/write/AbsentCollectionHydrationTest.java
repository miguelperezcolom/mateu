package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * A collection field the user never touched arrives as null, and must land as empty.
 *
 * <p>The counterpart to {@link ClearedFieldsHydrationTest}, and deliberately the opposite rule, for
 * a reason worth stating: a scalar CAN be absent. A user clearing a date means "no date", and null
 * is the faithful way to carry that. A collection cannot — the browser offers no way to say "no
 * list" as distinct from "an empty list", because a grid with no rows and a lookup with nothing
 * picked are the same thing on screen. Null there is transport noise, not a value, and every
 * consumer of the hydrated object would otherwise have to know it.
 *
 * <p>What it cost to leave it as null: creating a content in a deployed application threw {@code
 * NullPointerException: Cannot invoke "java.util.List.stream()" because "this.values" is null} on
 * the way to the use case, with the message naming the symptom and nothing naming the cause. Every
 * view model with a {@code @MasterDetail} or a multi-value {@code @Lookup} carried the same defect,
 * waiting for someone to submit without adding a row.
 */
class AbsentCollectionHydrationTest {

  static class Content {
    String name = "kept";
    List<String> labels = List.of("initial");
    Set<String> tags = Set.of("initial");
    List<String> values;
  }

  private static Content hydrated(Map<String, Object> state) {
    return Hydrater.hydrate(new Content(), state, null, null);
  }

  private static Map<String, Object> absent(String... fields) {
    var state = new HashMap<String, Object>();
    for (String field : fields) state.put(field, null);
    return state;
  }

  @Test
  void anAbsentListLandsEmptyRatherThanNull() {
    assertThat(hydrated(absent("values")).values).isNotNull().isEmpty();
  }

  @Test
  void anAbsentSetLandsEmptyToo() {
    assertThat(hydrated(absent("tags")).tags).isNotNull().isEmpty();
  }

  @Test
  void anAbsentListOverwritesWhateverTheInitializerLeft() {
    // The browser said "nothing here", and that is a value: keeping the initializer's contents
    // would resurrect entries the user had removed.
    assertThat(hydrated(absent("labels")).labels).isEmpty();
  }

  /** The empty collection has to be writable — a @MasterDetail grid adds rows to it. */
  @Test
  void theEmptyCollectionCanBeAddedTo() {
    var values = hydrated(absent("values")).values;

    values.add("added later");

    assertThat(values).containsExactly("added later");
  }

  @Test
  void anAbsentScalarIsStillNull() {
    // ClearedFieldsHydrationTest's rule is untouched: absence survives as absence where the UI
    // can actually express it.
    assertThat(hydrated(absent("name")).name).isNull();
  }

  @Test
  void aCollectionThatDoesArriveIsUnaffected() {
    var state = new HashMap<String, Object>();
    state.put("values", List.of("a", "b"));

    assertThat(hydrated(state).values).containsExactly("a", "b");
  }
}
