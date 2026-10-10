package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionPanelDto;
import io.mateu.dtos.ActionPanelItemDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The categorised action panel ("I want to…"): categories travel in order with their actions, a
 * count implies populated, and the defaults (label, 10 per column) are filled on the server so
 * every renderer gets the same panel.
 */
class ActionPanelSyncTest {

  @SuppressWarnings("unused")
  @UI("/action-panel")
  @Title("Reservation")
  public static class ReservationPage {
    String status = "IN_HOUSE";

    @Label("")
    Callable<Component> iWantTo =
        () ->
            ActionPanel.builder()
                .shortcut("ctrl+i")
                .hideUnpopulatedToggle(true)
                .categories(
                    List.of(
                        new ActionPanelCategory(
                            "Modify",
                            List.of(
                                new ActionPanelItem("Check out", "checkOut"),
                                ActionPanelItem.builder()
                                    .label("Traces")
                                    .actionId("traces")
                                    .count(3)
                                    .build())),
                        new ActionPanelCategory(
                            "Go to",
                            List.of(
                                ActionPanelItem.builder()
                                    .label("Billing")
                                    .actionId("goTo")
                                    .parameters(Map.of("target", "billing"))
                                    .populated(true)
                                    .build(),
                                ActionPanelItem.builder()
                                    .label("Reinstate")
                                    .actionId("reinstate")
                                    .disabled(true)
                                    .build()))))
                .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ReservationPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void panelTravelsWithItsCategoriesAndDefaults() {
    var increment = mateu.sync("/action-panel");
    var panels =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), ActionPanelDto.class);
    assertThat(panels).hasSize(1);
    var panel = panels.get(0);
    assertThat(panel.label()).isEqualTo("I want to…");
    assertThat(panel.shortcut()).isEqualTo("ctrl+i");
    assertThat(panel.maxPerCategory()).isEqualTo(10);
    assertThat(panel.hideUnpopulatedToggle()).isTrue();
    assertThat(panel.categories()).extracting(c -> c.title()).containsExactly("Modify", "Go to");
    assertThat(panel.categories().get(0).actions())
        .extracting(ActionPanelItemDto::actionId, ActionPanelItemDto::populated)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("checkOut", false),
            org.assertj.core.groups.Tuple.tuple("traces", true));
    var goTo = panel.categories().get(1).actions().get(0);
    assertThat(goTo.parameters()).containsEntry("target", "billing");
    assertThat(panel.categories().get(1).actions().get(1).disabled()).isTrue();
  }
}
