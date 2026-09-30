package io.mateu.core.application;

import static io.mateu.core.application.LayoutSyncTest.allMetadata;
import static io.mateu.core.application.LayoutSyncTest.findComponentWithMetadata;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.FoldoutPanelInfoDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.annotations.FoldoutDetail;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @FoldoutDetail}: a record shown read-only is an overview plus one foldout panel per
 * remaining section; what is empty is left out; editing keeps the regular form.
 */
class FoldoutDetailSyncTest {

  @SuppressWarnings("unused")
  @FoldoutDetail(
      overview = {"Reserva", "Importes"},
      folded = {"Seguimiento"})
  public static class BookingView {
    @Section("Reserva")
    String locator = "QN29HB";

    String hotel = "MRU01";

    String partner = "";

    @Section("Titular")
    String holder = "Giulia Keller";

    String phone = null;

    @Section("Pagos")
    List<String> payments = List.of();

    @Section("Importes")
    String total = "306.00 EUR";

    @Section("Cancelación")
    String cancellation = " ";

    @Section("Seguimiento")
    String version = "2";
  }

  /** The record shown read-only: an editable view's view mode. */
  @UI("/foldout/view")
  public static class BookingPage
      extends io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView<
          BookingView> {
    @Override
    public BookingView load(io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      return new BookingView();
    }

    @Override
    public void persist(BookingView entity, io.mateu.uidl.interfaces.HttpRequest httpRequest) {}
  }

  @SuppressWarnings("unused")
  @UI("/foldout/edit")
  @FoldoutDetail
  public static class BookingEditor {
    @Section("Reserva")
    String locator = "QN29HB";

    @Section("Titular")
    String holder = "Giulia Keller";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BookingPage.class, BookingEditor.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** The editable view in its view mode, as the renderer asks for it. */
  static io.mateu.dtos.UIIncrementDto view() {
    return mateu.run(
        io.mateu.dtos.RunActionRqDto.builder()
            .route("/foldout/view")
            .consumedRoute("/foldout/view")
            .serverSideType(BookingPage.class.getName())
            .actionId("")
            .initiatorComponentId("fv_app")
            .build());
  }

  @Test
  void theReadOnlyViewIsAnOverviewPlusOnePanelPerSectionWithContent() {
    var increment = view();
    var foldout = findComponentWithMetadata(increment, FoldoutLayoutDto.class);
    assertThat(foldout).isNotNull();
    var metadata = (FoldoutLayoutDto) foldout.metadata();
    // Pagos (empty list) and Cancelación (blank) have nothing to show: no panel for them.
    assertThat(metadata.panels())
        .extracting(FoldoutPanelInfoDto::title)
        .containsExactly("Titular", "Seguimiento");
    assertThat(metadata.panels())
        .extracting(FoldoutPanelInfoDto::open)
        .containsExactly(true, false);
    assertThat(metadata.orientation()).isEqualTo("vertical");
  }

  @Test
  void emptyFieldsAreLeftOutAndTheOverviewCarriesItsSections() {
    var ids = allMetadata(view(), FormFieldDto.class).stream().map(FormFieldDto::fieldId).toList();
    assertThat(ids).contains("locator", "hotel", "total", "holder", "version");
    assertThat(ids).doesNotContain("partner", "phone", "payments", "cancellation");
  }

  @Test
  void anEditableFormIsNotAFoldout() {
    assertThat(findComponentWithMetadata(mateu.sync("/foldout/edit"), FoldoutLayoutDto.class))
        .isNull();
  }
}
