package io.mateu.core.domain.act.crudfieldhandlers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import org.junit.jupiter.api.Test;

class CrudFieldHandlerHelperTest {

  static class RoomViewModel {}

  static class RoomTypeDto {}

  static class Guest {}

  @Title("Habitación")
  static class TitledViewModel {}

  @Test
  void aRowEditorIsTitledByTheRowAsAPersonSaysIt() {
    assertThat(CrudFieldHandlerHelper.detailTitle("New", RoomViewModel.class))
        .isEqualTo("New room");
    assertThat(CrudFieldHandlerHelper.detailTitle("Edit", RoomTypeDto.class))
        .isEqualTo("Edit room type");
    assertThat(CrudFieldHandlerHelper.detailTitle("New", Guest.class)).isEqualTo("New guest");
  }

  @Test
  void aRowClassWithATitleIsNamedByIt() {
    assertThat(CrudFieldHandlerHelper.detailTitle("New", TitledViewModel.class))
        .isEqualTo("New Habitación");
  }

  @Test
  void theRowEditorsActionsAreSavePrimaryAndCancelTertiary() {
    var buttons = CrudFieldHandlerHelper.rowEditorButtons("rooms", "_create", true);
    assertThat(buttons).hasSize(3);
    var save = (Button) buttons.get(0);
    var another = (Button) buttons.get(1);
    var cancel = (Button) buttons.get(2);
    assertThat(save.actionId()).isEqualTo("rooms_create");
    assertThat(save.buttonStyle()).isEqualTo(ButtonStyle.primary);
    assertThat(another.actionId()).isEqualTo("rooms_create-and-stay");
    assertThat(cancel.actionId()).isEqualTo("rooms_cancel");
    assertThat(cancel.buttonStyle()).isEqualTo(ButtonStyle.tertiary);

    assertThat(CrudFieldHandlerHelper.rowEditorButtons("rooms", "_save", false))
        .extracting(b -> ((Button) b).actionId())
        .containsExactly("rooms_save", "rooms_cancel");
  }
}
