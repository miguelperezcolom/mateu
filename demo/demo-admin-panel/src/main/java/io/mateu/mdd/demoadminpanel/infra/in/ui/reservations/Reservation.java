package io.mateu.mdd.demoadminpanel.infra.in.ui.reservations;

import io.mateu.mdd.demoadminpanel.infra.in.ui.checkin.MealPlan;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation implements Identifiable {

    @Hidden
    String id;

    @Override
    public String id() {
        return id;
    }

    @NotEmpty
    @Label("Locator")
    @Priority(value = 1, identifier = true)
    String localizador;

    @NotEmpty
    @Label("Hotel")
    @Filterable
    String hotel;

    @Label("Channel")
    String agencia;

    @NotEmpty
    @Label("Lead guest")
    String titular;

    @Label("Room type")
    String roomType;

    @Label("Meal plan")
    MealPlan mealPlan;

    @Min(1)
    @Label("Pax")
    int pax;

    @NotNull
    @Label("Arrival")
    @Filterable
    LocalDate arrivalDate;

    @NotNull
    @Label("Departure")
    LocalDate departureDate;

    @Label("Total price")
    BigDecimal totalPrice;

    @NotNull
    @Label("Status")
    @Status(
        defaultStatus = StatusType.NONE,
        mappings = {
            @StatusMapping(from = "PENDING",    to = StatusType.WARNING),
            @StatusMapping(from = "CONFIRMED",  to = StatusType.SUCCESS),
            @StatusMapping(from = "CANCELLED",  to = StatusType.DANGER),
            @StatusMapping(from = "NO_SHOW",    to = StatusType.CONTRAST)
        }
    )
    @Filterable
    ReservationStatus status;
}
