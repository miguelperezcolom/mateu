package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationLine {
    String id;
    String localizador;
    String hotel;
    String agencia;
    String titular;
    String roomType;
    String assignedRoom;
    MealPlan mealPlan;
    BigDecimal basePrice;
    BigDecimal totalPrice;
    int pax;
    LocalDate arrivalDate;
    LocalDate departureDate;
    CheckInStatus status;
    @Builder.Default
    List<GuestData> guests = new ArrayList<>();
}
