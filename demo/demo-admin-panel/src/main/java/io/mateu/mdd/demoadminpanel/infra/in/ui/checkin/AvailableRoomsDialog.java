package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.data.UICommandType;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Content of the "Preasignar habitación" dialog: a server-side, interactive grid of available
 * rooms (a small read-only CRUD). Selecting a row assigns that room to the reservation (via
 * {@link RoomService}), refreshes the check-in screen in place (by emitting "checkin-confirmed"
 * on the document bus, which {@code CheckInForm} subscribes to) and closes the dialog.
 *
 * <p>It is a {@link ComponentTreeSupplier} + {@link ActionHandler} (same pattern as the framework's
 * dialog precedents) so that row selection round-trips to the server. A plain {@code @PlainText}
 * POJO wrapped via {@code createComponent(...)} would render as a static, client-side page whose
 * row clicks never reach the backend.
 */
@Service
public class AvailableRoomsDialog implements ComponentTreeSupplier, ActionHandler {

    private final RoomService roomService;

    // Carries the reservation being assigned and the grid rows across the dialog's lifetime.
    private String reservationId;
    List<AvailableRoom> rooms = new ArrayList<>();

    public AvailableRoomsDialog(RoomService roomService) {
        this.roomService = roomService;
    }

    /** Seed the dialog for a given reservation. Called when opening the dialog. */
    public AvailableRoomsDialog load(String reservationId) {
        this.reservationId = reservationId;
        this.rooms = roomService.availableRooms();
        return this;
    }

    // Action id carries the reservation id (after the prefix) so it survives the round-trip even
    // when the action handler is instantiated fresh rather than reusing this seeded bean.
    private static final String SELECT_PREFIX = "onRoomSelected:";

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("")
                .content(List.of(
                        FormField.builder()
                                .id("rooms")
                                .label("")
                                .dataType(FieldDataType.array)
                                .stereotype(FieldStereotype.grid)
                                .readOnly(true)
                                .onItemSelectionActionId(SELECT_PREFIX + reservationId)
                                .columns(List.of(
                                        GridColumn.builder()
                                                .id("number").label("Nº habitación")
                                                .dataType(FieldDataType.string).width("9rem").build(),
                                        GridColumn.builder()
                                                .id("type").label("Tipo habitación")
                                                .dataType(FieldDataType.string).autoWidth(true).build(),
                                        GridColumn.builder()
                                                .id("state").label("Estado")
                                                .dataType(FieldDataType.string).width("9rem").build()
                                ))
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith(SELECT_PREFIX)) {
            var room = httpRequest.getClickedRow(AvailableRoom.class);
            if (room == null || room.getNumber() == null) {
                return null;
            }
            var rid = actionId.substring(SELECT_PREFIX.length());
            roomService.assignRoom(rid, room.getNumber());
            return List.of(
                    Message.success("Habitación " + room.getNumber() + " preasignada"),
                    // Refresh the whole check-in form in place (subscribed on the document bus).
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", rid)),
                    // Close the dialog.
                    UICommand.builder().type(UICommandType.CloseModal).build()
            );
        }
        return null;
    }
}
