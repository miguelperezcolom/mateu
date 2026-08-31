package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The property that separates a delta from a snapshot.
 *
 * <p>A stored snapshot answers "what did the screen look like when someone last touched it". A
 * delta answers "what did that person DECIDE" — and the difference only shows up later, when the
 * model changes underneath. These tests are that later.
 */
class LayoutDeltaTest {

  private static final List<String> INFERRED = List.of("name", "email", "age");

  @Test
  void aFieldTheModelGrowsLaterStillAppears() {
    // THE test. A human reordered two fields months ago; today someone adds `phone` to the record.
    // With a snapshot, `phone` is invisible and nobody knows why. With a delta, it simply is not
    // mentioned, so it lands in its inferred place.
    var delta = new LayoutDelta(List.of("email", "name"), List.of(), Map.of());

    var withNewField = List.of("name", "email", "age", "phone");

    assertThat(delta.applyTo(withNewField)).containsExactly("email", "name", "age", "phone");
  }

  @Test
  void aFieldTheModelLosesIsIgnoredRatherThanFatal() {
    // The mirror case: the delta still names a field that no longer exists. A snapshot would render
    // a ghost; the delta drops it and the page keeps working.
    var delta = new LayoutDelta(List.of("email", "removed", "name"), List.of(), Map.of());

    assertThat(delta.applyTo(INFERRED)).containsExactly("email", "name", "age");
  }

  @Test
  void unmentionedFieldsKeepTheirInferredOrder() {
    var delta = new LayoutDelta(List.of("age"), List.of(), Map.of());
    assertThat(delta.applyTo(INFERRED)).containsExactly("age", "name", "email");
  }

  @Test
  void hidingIsExplicitAndSurvivesReordering() {
    var delta = new LayoutDelta(List.of("age"), List.of("email"), Map.of());
    assertThat(delta.applyTo(INFERRED)).containsExactly("age", "name");
  }

  @Test
  void anEmptyDeltaChangesNothing() {
    assertThat(LayoutDelta.empty().applyTo(INFERRED)).isEqualTo(INFERRED);
    assertThat(LayoutDelta.empty().isEmpty()).isTrue();
  }

  @Test
  void openingAScreenInTheEditorAndChangingNothingDoesNotFreezeIt() {
    // The trap to avoid: if merely touching a screen produced a delta, the editor would still take
    // it out of inference — the same failure with extra steps. Dragging nothing must record
    // nothing.
    var delta = LayoutDelta.between(INFERRED, INFERRED);

    assertThat(delta.isEmpty()).isTrue();
  }

  @Test
  void theEditorRecordsOnlyWhatTheHumanActuallyChanged() {
    var delta = LayoutDelta.between(INFERRED, List.of("email", "name"));

    assertThat(delta.order()).containsExactly("email", "name");
    assertThat(delta.hidden()).containsExactly("age");
  }

  @Test
  void aRecordedDeltaReproducesWhatTheHumanArranged() {
    // Round trip: what `between` records must be what `applyTo` gives back, or the editor would
    // save one thing and the server render another.
    var desired = List.of("email", "name");
    var delta = LayoutDelta.between(INFERRED, desired);

    assertThat(delta.applyTo(INFERRED)).isEqualTo(desired);
  }

  @Test
  void overridesAreLookedUpWithoutBranchingOnNull() {
    var delta =
        new LayoutDelta(
            List.of(),
            List.of(),
            Map.of("name", new LayoutDelta.FieldOverride("Full name", 2, null)));

    assertThat(delta.overrideFor("name").label()).isEqualTo("Full name");
    assertThat(delta.overrideFor("name").colspan()).isEqualTo(2);
    assertThat(delta.overrideFor("absent").label()).isNull();
  }
}
