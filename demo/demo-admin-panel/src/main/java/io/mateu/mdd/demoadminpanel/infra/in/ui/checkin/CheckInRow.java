package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Priority;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.annotations.StatusMapping;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Identifiable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** One arrival row in the "Arrivals" listing. Mirrors the working ReservationRow conventions. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRow implements Identifiable {

    @Hidden
    String id;

    @Override
    public String id() {
        return id;
    }

    @Label("Huésped")
    @Priority(value = 1, identifier = true)
    String titular;

    @Label("Localizador")
    @Priority(value = 2)
    String localizador;

    @Label("Agencia")
    @Priority(value = 2)
    String agencia;

    @Label("Tipo hab.")
    @Priority(value = 2)
    String roomType;

    @Label("Habitación")
    @Priority(value = 2)
    String assignedRoom;

    @Label("Pax")
    @Priority(value = 2)
    int pax;

    @Label("Llegada")
    @Priority(value = 2)
    LocalDate arrivalDate;

    @Label("Salida")
    @Priority(value = 2)
    LocalDate departureDate;

    @Label("Estado")
    @Priority(value = 2)
    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "PENDING",     to = StatusType.WARNING),
            @StatusMapping(from = "CHECKED_IN",  to = StatusType.SUCCESS),
            @StatusMapping(from = "CHECKED_OUT", to = StatusType.NONE)
        }
    )
    CheckInStatus status;

    @Label("")
    ColumnAction actions;
}
