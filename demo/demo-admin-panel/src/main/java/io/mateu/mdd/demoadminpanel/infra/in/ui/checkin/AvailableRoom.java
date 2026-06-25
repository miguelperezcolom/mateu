package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A free room as shown in the "Preasignar habitación" selection grid.
 * Columns: room number, room type and physical state.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableRoom {
    @ColumnWidth("9rem") @Label("Nº habitación") String number;
    @Label("Tipo habitación") String type;
    @ColumnWidth("9rem") @Label("Estado") RoomState state;
}
