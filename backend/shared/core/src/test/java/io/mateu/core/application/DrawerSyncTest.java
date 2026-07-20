package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.DrawerPositionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerPosition;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.CustomEvent;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The drawer overlay: an action returning a {@link Drawer} maps to a {@link DrawerDto} fragment
 * ADDED on top of the initiator (like dialogs), and the closeModal(eventName[, payload]) commands
 * carry the event so the host page can refresh or receive the overlay's result.
 */
class DrawerSyncTest {

  // ── fixtures ────────────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/drawer-host")
  public static class DrawerHostForm {

    String name = "n";

    @Action
    Drawer openDrawer() {
      return Drawer.builder()
          .id("guest-drawer")
          .headerTitle("Editar huésped")
          .position(DrawerPosition.start)
          .width("480px")
          .content(new Text("drawer body"))
          .initialData(Map.of("guestId", 7))
          .build();
    }

    @Action
    Drawer openDefaultDrawer() {
      return Drawer.builder().headerTitle("Sin posición").content(new Text("body")).build();
    }

    @Action
    Drawer openGeneralDrawer() {
      return Drawer.builder()
          .headerTitle("Ada Lovelace")
          .subtitle("Employee #100")
          .size(io.mateu.uidl.data.DrawerSize.l)
          .maximizable(true)
          .peerNav(new io.mateu.uidl.data.PeerNav(null, null, "Alan Turing", "/staff/2"))
          .content(new Text("read-only details"))
          .build();
    }

    @Action
    Drawer openBottomDrawer() {
      return Drawer.builder()
          .headerTitle("Detalles")
          .position(DrawerPosition.bottom)
          .collapsible(true)
          .content(new Text("bottom body"))
          .build();
    }

    @Action
    UICommand saveAndClose() {
      return UICommand.closeModal("guest-saved", Map.of("id", 7));
    }

    @Action
    UICommand closeNotifying() {
      return UICommand.closeModal("drawer-dismissed");
    }

    @Action
    UICommand justClose() {
      return UICommand.closeModal();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DrawerHostForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/drawer-host")
            .actionId(actionId)
            .serverSideType(DrawerHostForm.class.getName())
            .initiatorComponentId("cmp-1")
            .componentState(Map.of("name", "n"))
            .build());
  }

  private static List<UICommandDto> commandsOfType(
      UIIncrementDto increment, UICommandTypeDto type) {
    return increment.commands().stream().filter(c -> c.type() == type).toList();
  }

  // ── drawer fragment ─────────────────────────────────────────────────────────

  @Test
  void actionReturningDrawerMapsToAnAddedDrawerFragment() {
    var increment = run("openDrawer");
    assertThat(increment.fragments()).hasSize(1);
    var fragment = increment.fragments().get(0);
    // ADD, not Replace: the drawer stacks on top of the page instead of replacing it
    assertThat(fragment.action()).isEqualTo(UIFragmentActionDto.Add);
    var drawer = (DrawerDto) ((ClientSideComponentDto) fragment.component()).metadata();
    assertThat(drawer.id()).isEqualTo("guest-drawer");
    assertThat(drawer.headerTitle()).isEqualTo("Editar huésped");
    assertThat(drawer.position()).isEqualTo(DrawerPositionDto.start);
    assertThat(drawer.width()).isEqualTo("480px");
    assertThat(drawer.initialData()).isEqualTo(Map.of("guestId", 7));
    assertThat(drawer.content()).isNotNull();
  }

  @Test
  void drawerWithoutPositionDefaultsToEnd() {
    var increment = run("openDefaultDrawer");
    var drawer =
        (DrawerDto) ((ClientSideComponentDto) increment.fragments().get(0).component()).metadata();
    assertThat(drawer.position()).isEqualTo(DrawerPositionDto.end);
  }

  @Test
  void bottomDrawerCarriesTheBottomPositionAndCollapsibleFlag() {
    var increment = run("openBottomDrawer");
    var drawer =
        (DrawerDto) ((ClientSideComponentDto) increment.fragments().get(0).component()).metadata();
    assertThat(drawer.position()).isEqualTo(DrawerPositionDto.bottom);
    assertThat(drawer.collapsible()).isTrue();
  }

  @Test
  void generalDrawerCarriesSubtitleSizeMaximizableAndPeerNav() {
    var increment = run("openGeneralDrawer");
    var drawer =
        (DrawerDto) ((ClientSideComponentDto) increment.fragments().get(0).component()).metadata();
    assertThat(drawer.subtitle()).isEqualTo("Employee #100");
    assertThat(drawer.size()).isEqualTo("l");
    assertThat(drawer.maximizable()).isTrue();
    assertThat(drawer.peerNav()).isNotNull();
    assertThat(drawer.peerNav().prevRoute()).isNull();
    assertThat(drawer.peerNav().nextRoute()).isEqualTo("/staff/2");
  }

  // ── closeModal commands ─────────────────────────────────────────────────────

  @Test
  void closeModalWithEventAndPayloadCarriesTheCustomEvent() {
    var increment = run("saveAndClose");
    var closes = commandsOfType(increment, UICommandTypeDto.CloseModal);
    assertThat(closes).hasSize(1);
    var event = (CustomEvent) closes.get(0).data();
    assertThat(event.eventName()).isEqualTo("guest-saved");
    assertThat(event.detail()).isEqualTo(Map.of("id", 7));
  }

  @Test
  void closeModalWithEventOnlyHasNullDetail() {
    var increment = run("closeNotifying");
    var closes = commandsOfType(increment, UICommandTypeDto.CloseModal);
    assertThat(closes).hasSize(1);
    var event = (CustomEvent) closes.get(0).data();
    assertThat(event.eventName()).isEqualTo("drawer-dismissed");
    assertThat(event.detail()).isNull();
  }

  @Test
  void plainCloseModalCarriesNoData() {
    var increment = run("justClose");
    var closes = commandsOfType(increment, UICommandTypeDto.CloseModal);
    assertThat(closes).hasSize(1);
    assertThat(closes.get(0).data()).isNull();
  }
}
