package io.mateu.mdd.demovbpms.infra.in.ui.housekeeping;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

/**
 * The "Set Room Status" dialog of the Housekeeping Board: the selected rooms and the status to give
 * them all. Applying it changes the rooms and closes the dialog emitting the crud's saved event, so
 * the board refreshes in place.
 */
public class SetRoomStatusForm implements ComponentTreeSupplier, ActionHandler, StateSupplier {

  private final List<String> rooms;

  public SetRoomStatusForm() {
    this(List.of());
  }

  public SetRoomStatusForm(List<String> rooms) {
    this.rooms = rooms;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return Form.builder()
        .title("")
        .content(
            List.of(
                FormField.builder()
                    .id("rooms")
                    .label("Rooms")
                    .dataType(FieldDataType.string)
                    .readOnly(true)
                    .initialValue(String.join(", ", rooms))
                    .build(),
                FormField.builder()
                    .id("status")
                    .label("New status")
                    .dataType(FieldDataType.string)
                    .stereotype(FieldStereotype.radio)
                    .required(true)
                    .initialValue(Hotel.HousekeepingStatus.CL.name())
                    .options(
                        Arrays.stream(Hotel.HousekeepingStatus.values())
                            .map(s -> new Option(s.name(), s.name() + " · " + s.label))
                            .toList())
                    .build(),
                Button.builder()
                    .label("Apply")
                    .actionId("apply-room-status")
                    .buttonStyle(ButtonStyle.primary)
                    .build(),
                Button.builder().label("Cancel").actionId("cancel-room-status").build()))
        .build();
  }

  /** The selected rooms and the default status travel in the state, so Apply carries them. */
  @Override
  public Object state(HttpRequest httpRequest) {
    return Map.of("rooms", String.join(", ", rooms), "status", Hotel.HousekeepingStatus.CL.name());
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("apply-room-status".equals(actionId)) {
      var state = httpRequest.runActionRq().componentState();
      var numbers =
          Arrays.stream(String.valueOf(state.getOrDefault("rooms", "")).split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .toList();
      var status = Hotel.HousekeepingStatus.valueOf(String.valueOf(state.get("status")));
      Hotel.setRoomStatus(numbers, status);
      return List.of(
          Message.success(numbers.size() + " rooms set to " + status.label),
          UICommand.closeModal(Crud.SAVED_IN_DRAWER_EVENT));
    }
    if ("cancel-room-status".equals(actionId)) {
      return UICommand.closeModal();
    }
    return null;
  }
}
