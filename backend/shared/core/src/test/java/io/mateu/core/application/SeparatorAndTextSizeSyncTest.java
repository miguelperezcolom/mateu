package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.SeparatorDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.TextSize;
import io.mateu.uidl.fluent.Component;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Separators and text sizes: @SeparatorBefore paints a full-width divider (SeparatorDto in its own
 * form row, data-colspan = the form's columns) above the annotated field; @Text(size=…) and the
 * fluent Text.size travel on the wire so the renderer enlarges/reduces the font (m = nothing).
 */
class SeparatorAndTextSizeSyncTest {

  @SuppressWarnings("unused")
  @UI("/separator")
  @Title("Separator")
  public static class SeparatorForm {
    @Label("Nombre")
    String nombre = "María";

    @SeparatorBefore
    @Label("Email")
    String email;

    @Text(container = TextContainer.p, size = TextSize.xl)
    String titular = "Bienvenida";

    @Text(container = TextContainer.p)
    String detalle = "Sin tamaño";

    @Text(container = TextContainer.p, noMargins = true)
    String apretado = "Sin márgenes";

    @Label("")
    Callable<Component> fluent =
        () ->
            io.mateu.uidl.data.Text.builder()
                .text("pequeño")
                .container(TextContainer.span)
                .size(TextSize.xs)
                .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SeparatorForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void separatorBeforePaintsAFullWidthDividerAboveTheField() {
    var increment = mateu.sync("/separator");
    var separators =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), SeparatorDto.class);
    assertThat(separators).hasSize(1);
    assertThat(separators.get(0).attributes()).containsKey("data-colspan");
  }

  @Test
  void textSizeTravelsOnTheWireAndMOrAbsentMeansNothing() {
    var increment = mateu.sync("/separator");
    var texts = FieldKindsSyncTest.collect(increment.fragments().get(0).component(), TextDto.class);
    assertThat(texts)
        .extracting(TextDto::text, TextDto::size, TextDto::noMargins)
        .contains(
            org.assertj.core.groups.Tuple.tuple("${state.titular}", "xl", false),
            org.assertj.core.groups.Tuple.tuple("${state.detalle}", "m", false),
            // noMargins is independent of size
            org.assertj.core.groups.Tuple.tuple("${state.apretado}", "m", true),
            org.assertj.core.groups.Tuple.tuple("pequeño", "xs", false));
  }
}
