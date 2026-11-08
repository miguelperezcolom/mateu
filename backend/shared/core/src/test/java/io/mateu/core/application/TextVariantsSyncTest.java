package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.groups.Tuple.tuple;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextVariant;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.Test;

/**
 * A Text's {@code variants} (b = bold, i = italic) reach the wire. They were declared on the record
 * and in the YAML schema but {@code TextMapper} dropped them, so neither a YAML {@code variants:
 * [b]} nor the fluent {@code Text.variants} was ever drawn bold or italic.
 */
class TextVariantsSyncTest {

  @UI("/text-variants")
  public static class FluentTexts {
    @Label("")
    Callable<Component> bold = () -> new Text("bold", List.of(TextVariant.b));

    @Label("")
    Callable<Component> plain = () -> new Text("plain");
  }

  private static final String YAML =
      """
      type: VerticalLayout
      content:
        - {type: Text, text: bold, variants: [b]}
        - {type: Text, text: italic, variants: [i]}
        - {type: Text, text: bold italic, variants: [b, i]}
        - {type: Text, text: plain}
      """;

  @Test
  void yamlVariantsTravelOnTheWire() {
    try (var mateu = TestMateu.withUis(FluentTexts.class)) {
      var increment =
          mateu.run(
              RunActionRqDto.builder()
                  .route("/text-variants")
                  .consumedRoute("")
                  .actionId("__preview__")
                  .initiatorComponentId("content")
                  .componentState(Map.of())
                  .parameters(Map.of("_yaml", YAML))
                  .build());
      var texts =
          FieldKindsSyncTest.collect(increment.fragments().get(0).component(), TextDto.class);
      assertThat(texts)
          .extracting(TextDto::text, TextDto::variants)
          .containsExactly(
              tuple("bold", List.of("b")),
              tuple("italic", List.of("i")),
              tuple("bold italic", List.of("b", "i")),
              // no variants = nothing on the wire (absent, not an empty list)
              tuple("plain", null));
    }
  }

  @Test
  void fluentVariantsTravelOnTheWire() {
    try (var mateu = TestMateu.withUis(FluentTexts.class)) {
      var texts =
          FieldKindsSyncTest.collect(
              mateu.sync("/text-variants").fragments().get(0).component(), TextDto.class);
      assertThat(texts)
          .extracting(TextDto::text, TextDto::variants)
          .contains(tuple("bold", List.of("b")), tuple("plain", null));
    }
  }
}
