package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.NoticeDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.fluent.Component;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Notices: the compact inline banner (theme-tinted strip + severity icon + one line of text +
 * optional action) travels as NoticeDto with its theme and action.
 */
class NoticeSyncTest {

  @SuppressWarnings("unused")
  @UI("/notice")
  @Title("Notice")
  public static class NoticeForm {
    @Label("")
    Callable<Component> aviso =
        () ->
            Notice.builder()
                .text("2 quejas pendientes")
                .theme("danger")
                .actionLabel("Revisar")
                .actionId("review")
                .build();

    // @Notice on a String field: the value is the text (blank hides), params on the annotation
    @io.mateu.uidl.annotations.Notice(theme = "warning", slim = true, fullWidth = true)
    String stock = "Stock bajo";

    // arbitrary content inside the notice: components travel as slotted children
    @Label("")
    Callable<Component> conContenido =
        () ->
            Notice.builder()
                .theme("info")
                .content(
                    java.util.List.of(
                        io.mateu.uidl.data.Text.builder()
                            .text("detalle dentro del notice")
                            .build()))
                .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NoticeForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void noticeTravelsWithThemeTextAndAction() {
    var increment = mateu.sync("/notice");
    var notices =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), NoticeDto.class);
    assertThat(notices).hasSize(3);
    assertThat(notices.get(0).text()).isEqualTo("2 quejas pendientes");
    assertThat(notices.get(0).theme()).isEqualTo("danger");
    assertThat(notices.get(0).actionLabel()).isEqualTo("Revisar");
    assertThat(notices.get(0).actionId()).isEqualTo("review");
  }

  @Test
  void noticeContentTravelsAsSlottedChildren() {
    var increment = mateu.sync("/notice");
    var root = increment.fragments().get(0).component();
    var texts = FieldKindsSyncTest.collect(root, io.mateu.dtos.TextDto.class);
    assertThat(texts).extracting(io.mateu.dtos.TextDto::text).contains("detalle dentro del notice");
  }

  @Test
  void noticeAnnotationRendersTheFieldValueWithItsParams() {
    var increment = mateu.sync("/notice");
    var notices =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), NoticeDto.class);
    var stock =
        notices.stream().filter(n -> "${state.stock}".equals(n.text())).findFirst().orElseThrow();
    assertThat(stock.theme()).isEqualTo("warning");
    assertThat(stock.slim()).isTrue();
    assertThat(stock.fullWidth()).isTrue();
  }
}
