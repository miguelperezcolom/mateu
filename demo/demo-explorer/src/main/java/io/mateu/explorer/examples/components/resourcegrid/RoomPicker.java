package io.mateu.explorer.examples.components.resourcegrid;

import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.ResourceGrid;
import io.mateu.uidl.data.ResourceItem;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A grid of bookable resources: each card a title, a subtitle, a coloured status and a note. A
 * {@code recommended} card is flagged, a {@code disabled} one never dispatches. A click runs the
 * grid's {@code actionId} with the card id in {@code _item}; here the pick is the view's state.
 */
public class RoomPicker implements ComponentTreeSupplier {

  String picked;

  @Override
  public Component component(HttpRequest httpRequest) {
    return ResourceGrid.builder()
        .actionId("pickRoom")
        .columns(4)
        .recommendedLabel("Best fit")
        .items(
            List.of(
                room("r1", "Auditorium", "120 seats", "Free", "success", "Projector, stage", false, true),
                room("r2", "Seminar room", "30 seats", "Free", "success", "Whiteboard", false, false),
                room("r3", "Studio", "12 seats", "Cleaning", "warning", "Ready at 14:00", false, false),
                room("r4", "Board room", "16 seats", "Booked", "error", "Until 18:00", true, false)))
        .build();
  }

  ResourceItem room(String id, String title, String subtitle, String status, String color, String note,
      boolean disabled, boolean recommended) {
    return ResourceItem.builder()
        .id(id)
        .title(title)
        .subtitle(subtitle)
        .statusLabel(status)
        .statusColor(color)
        .note(note)
        .disabled(disabled)
        .recommended(recommended)
        .selected(id.equals(picked))
        .build();
  }

  public Object pickRoom(HttpRequest httpRequest) {
    picked = (String) httpRequest.runActionRq().parameters().get("_item");
    return List.of(this, Message.success("Room " + picked + " held for you"));
  }
}
