package io.mateu.mdd.demoadminpanel.infra.in.ui.reservations;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Identifiable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRow implements Identifiable {

    @Hidden
    String id;

    @Override
    public String id() {
        return id;
    }

    @Label("Locator")
    @Priority(value = 1, identifier = true)
    String localizador;

    @Label("Hotel")
    @Priority(value = 2)
    String hotel;

    @Label("Guest")
    @Priority(value = 2)
    String titular;

    @Label("Arrival")
    @Priority(value = 2)
    LocalDate arrivalDate;

    @Label("Status")
    @Priority(value = 2)
    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "PENDING",    to = StatusType.WARNING),
            @StatusMapping(from = "CONFIRMED",  to = StatusType.SUCCESS),
            @StatusMapping(from = "CANCELLED",  to = StatusType.DANGER),
            @StatusMapping(from = "NO_SHOW",    to = StatusType.INFO)
        }
    )
    ReservationStatus status;
}
