package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.FoldoutPanelInfoDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.FoldoutDetail;
import io.mateu.uidl.annotations.PanelWidth;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@code @FoldoutDetail} record with no overview declared opens on its first section; each panel
 * is sized for what it holds — a declared {@code panelWidth}, wide for collections/maps, narrow for
 * a few fields, medium for more — and a section whose values are all empty (an empty map, array,
 * list) gets no panel.
 */
class FoldoutDetailWidthsSyncTest {

  @SuppressWarnings("unused")
  @FoldoutDetail
  public static class RoomRecord {
    @Section("Room")
    String number = "101";

    @Section(value = "Notes", panelWidth = PanelWidth.WIDE)
    String note = "quiet";

    @Section(value = "Flags", panelWidth = PanelWidth.NARROW)
    String flag = "vip";

    @Section(value = "Rates", panelWidth = PanelWidth.MEDIUM)
    String rate = "120";

    @Section("Extras")
    Map<String, String> extras = Map.of("crib", "yes");

    @Section("Housekeeping")
    String a = "1";

    String b = "2";
    String c = "3";
    String d = "4";
    String e = "5";

    @Section("Nothing")
    Map<String, String> emptyMap = Map.of();

    String[] emptyArray = new String[0];
    List<String> emptyList = List.of();
  }

  @UI("/foldout-widths")
  public static class RoomPage extends AutoEditableView<RoomRecord> {
    @Override
    public RoomRecord load(HttpRequest httpRequest) {
      return new RoomRecord();
    }

    @Override
    public void persist(RoomRecord entity, HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RoomPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto view() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/foldout-widths")
            .consumedRoute("/foldout-widths")
            .serverSideType(RoomPage.class.getName())
            .actionId("")
            .initiatorComponentId("fw_app")
            .build());
  }

  @Test
  void panelsAreSizedForWhatTheyHoldAndTheFirstSectionIsTheOverview() {
    var foldout = WireWalk.first(view(), FoldoutLayoutDto.class);
    assertThat(foldout).isNotNull();
    assertThat(foldout.panels())
        .extracting(FoldoutPanelInfoDto::title)
        .containsExactly("Notes", "Flags", "Rates", "Extras", "Housekeeping");
    assertThat(foldout.panels())
        .extracting(FoldoutPanelInfoDto::width)
        .containsExactly("44rem", "20rem", "28rem", "44rem", "28rem");
  }
}
