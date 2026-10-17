package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.LayoutDeltaApplier;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.LayoutDelta;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Applying a {@code layoutDelta:} to a freshly inferred tree.
 *
 * <p>Parsing a delta was never the point — re-applying it is. A {@code layout:} is a snapshot and
 * ends a screen's participation in inference; a delta is re-applied to whatever inference produces
 * <b>this</b> request, which is what lets a field the model grows later still appear.
 */
class LayoutDeltaApplierTest {

  private static FormLayout inferred(String... ids) {
    return FormLayout.builder()
        .content(
            java.util.Arrays.stream(ids)
                .map(id -> (Component) FormField.builder().id(id).label(id).build())
                .toList())
        .build();
  }

  private static List<String> idsOf(Component component) {
    return ((FormLayout) component)
        .content().stream()
            .filter(FormField.class::isInstance)
            .map(child -> ((FormField) child).id())
            .toList();
  }

  @Test
  void anEmptyDeltaLeavesTheInferredTreeUntouched() {
    // Identity, not just equality: applying runs on the render path of every page with a model.
    var tree = inferred("name", "email", "age");

    assertThat(LayoutDeltaApplier.apply(tree, LayoutDelta.empty())).isSameAs(tree);
  }

  @Test
  void theOrderTheHumanChoseIsApplied() {
    var delta = new LayoutDelta(List.of("email", "name"), List.of(), Map.of());

    assertThat(idsOf(LayoutDeltaApplier.apply(inferred("name", "email", "age"), delta)))
        .containsExactly("email", "name", "age");
  }

  @Test
  void aFieldTheModelGrewSinceTheDeltaWasWrittenStillAppears() {
    // THE reason this is a delta and not a snapshot.
    var delta = new LayoutDelta(List.of("email", "name"), List.of(), Map.of());

    assertThat(idsOf(LayoutDeltaApplier.apply(inferred("name", "email", "age", "phone"), delta)))
        .containsExactly("email", "name", "age", "phone");
  }

  @Test
  void aDeltaEntryForAFieldTheModelLostIsIgnoredRatherThanFatal() {
    var delta = new LayoutDelta(List.of("email", "removed", "name"), List.of(), Map.of());

    assertThat(idsOf(LayoutDeltaApplier.apply(inferred("name", "email"), delta)))
        .containsExactly("email", "name");
  }

  @Test
  void hiddenFieldsAreRemovedWhereverTheySit() {
    var delta = new LayoutDelta(List.of(), List.of("age"), Map.of());
    var nested =
        new VerticalLayout(
            List.of(
                inferred("name"),
                new FormLayout(
                    null,
                    List.of(FormField.builder().id("age").build()),
                    false,
                    false,
                    0,
                    null,
                    false,
                    false,
                    null,
                    null,
                    null,
                    null,
                    null,
                    "",
                    "")));

    var applied = (VerticalLayout) LayoutDeltaApplier.apply(nested, delta);

    assertThat(idsOf(applied.content().get(0))).containsExactly("name");
    assertThat(idsOf(applied.content().get(1))).isEmpty();
  }

  @Test
  void overridesAreAppliedToTheFieldRatherThanToAPosition() {
    var delta =
        new LayoutDelta(
            List.of(),
            List.of(),
            Map.of("name", new LayoutDelta.FieldOverride("Full name", 2, null)));

    var applied = (FormLayout) LayoutDeltaApplier.apply(inferred("name", "email"), delta);
    var name = (FormField) applied.content().get(0);

    assertThat(name.label()).isEqualTo("Full name");
    assertThat(name.colspan()).isEqualTo(2);
    assertThat(((FormField) applied.content().get(1)).label()).isEqualTo("email");
  }

  @Test
  void nonFieldSiblingsKeepTheirSlotWhenFieldsAreReordered() {
    // A delta says "these fields, in this order" — not "rebuild the tree". A separator between two
    // fields is not something it is entitled to move.
    var tree =
        new FormLayout(
            null,
            List.of(
                FormField.builder().id("name").build(),
                new Text("a note"),
                FormField.builder().id("email").build()),
            false,
            false,
            0,
            null,
            false,
            false,
            null,
            null,
            null,
            null,
            null,
            "",
            "");
    var delta = new LayoutDelta(List.of("email", "name"), List.of(), Map.of());

    var applied = (FormLayout) LayoutDeltaApplier.apply(tree, delta);

    assertThat(applied.content().get(1)).isInstanceOf(Text.class);
    assertThat(idsOf(applied)).containsExactly("email", "name");
  }

  @Test
  void theOrderAppliesAcrossTheRowsOfATwoColumnForm() {
    // Inference lays a two-column form out as rows of two; the editor records `order:` for the
    // flat run of fields. Reordering only within a row did nothing on any form of 3+ fields.
    var field =
        (java.util.function.Function<String, Component>) id -> FormField.builder().id(id).build();
    var tree =
        FormLayout.builder()
            .content(
                List.of(
                    new io.mateu.uidl.data.FormRow(
                        null, List.of(field.apply("count"), field.apply("secret")), null, null),
                    new io.mateu.uidl.data.FormRow(null, List.of(field.apply("note")), null, null)))
            .build();
    var delta = new LayoutDelta(List.of("note", "count"), List.of(), Map.of());

    var applied = (FormLayout) LayoutDeltaApplier.apply(tree, delta);

    var rows =
        applied.content().stream()
            .map(
                row ->
                    ((io.mateu.uidl.data.FormRow) row)
                        .content().stream().map(c -> ((FormField) c).id()).toList())
            .toList();
    assertThat(rows).containsExactly(List.of("note", "count"), List.of("secret"));
  }
}
