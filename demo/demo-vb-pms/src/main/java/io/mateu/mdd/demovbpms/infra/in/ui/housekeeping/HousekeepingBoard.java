package io.mateu.mdd.demovbpms.infra.in.ui.housekeeping;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.NotCreatable;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.NotEditable;
import io.mateu.uidl.annotations.NotNavigable;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.RowStatus;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Tooltip;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;

/**
 * Housekeeping Board (OPERA Cloud 26.3 user guide, 005 "Using the Housekeeping Board"): the rooms
 * with their housekeeping status, toned by it (dirty = warning, out of order = danger, inspected =
 * success); hovering the status shows who has the room. Select several rooms and <i>Set room
 * status</i> opens a dialog that changes them all at once. The board refreshes itself every 15 s
 * in the background while the attendants work.
 */
@UI("/housekeeping-board")
@Title("Housekeeping board")
@NotCreatable
@NotDeletable
@NotEditable
@NotNavigable
// the Set Room Status dialog closes emitting the crud's saved event: the board searches again
@Trigger(type = TriggerType.OnCustomEvent, eventName = Crud.SAVED_IN_DRAWER_EVENT, actionId = "search")
@Trigger(
    type = TriggerType.OnSuccess,
    actionId = "search",
    calledActionId = "search",
    timeoutMillis = HousekeepingBoard.REFRESH_MILLIS,
    background = true)
public class HousekeepingBoard extends AutoCrud<HousekeepingBoard.RoomRow> {

  static final int REFRESH_MILLIS = 15_000;

  /** A housekeeping round at most this often: the refreshes show the attendants' progress. */
  private static final long ROUND_MILLIS = 20_000;

  private static volatile long lastRound = System.currentTimeMillis();

  public enum Tone {
    success,
    warning,
    danger,
    info,
    neutral
  }

  public record RoomRow(
      @HiddenInList @ReadOnly String id,
      String room,
      int floor,
      String roomType,
      @Tooltip("attendant") String status,
      @HiddenInList @RowStatus Tone tone,
      @HiddenInList @ReadOnly String attendant)
      implements Identifiable {}

  static final List<String> ATTENDANTS = List.of("Lucía M.", "Tomás R.", "Ana P.", "Jordi S.");

  static RoomRow rowOf(Hotel.Room r) {
    var tone =
        switch (r.status()) {
          case DI -> Tone.warning;
          case OO, OS -> Tone.danger;
          case IP -> Tone.success;
          default -> null;
        };
    var attendant = ATTENDANTS.get(Math.floorMod(r.number().hashCode(), ATTENDANTS.size()));
    return new RoomRow(
        r.number(),
        r.number(),
        r.floor(),
        r.typeLabel(),
        r.status().name() + " · " + r.status().label,
        tone,
        "Section " + r.floor() + " · " + attendant);
  }

  @Override
  public GridLayout gridLayout() {
    return GridLayout.table;
  }

  @ListToolbarButton
  Dialog setRoomStatus(List<RoomRow> selection) {
    return Dialog.builder()
        .id("set-room-status")
        .headerTitle("Set room status")
        .width("26rem")
        .content(new SetRoomStatusForm(selection.stream().map(RoomRow::room).toList()))
        .build();
  }

  @Override
  public CrudStore<RoomRow> store() {
    return new CrudStore<>() {
      @Override
      public Optional<RoomRow> findById(String id) {
        return Hotel.room(id).map(HousekeepingBoard::rowOf);
      }

      @Override
      public String save(RoomRow entity) {
        return entity.id();
      }

      @Override
      public List<RoomRow> findAll() {
        if (System.currentTimeMillis() - lastRound > ROUND_MILLIS) {
          lastRound = System.currentTimeMillis();
          Hotel.housekeepingRound();
        }
        return Hotel.ROOMS.stream().map(HousekeepingBoard::rowOf).toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }
}
