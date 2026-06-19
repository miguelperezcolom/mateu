package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A guest as shown in the "Detalle de estancia (PAX)" grid.
 * Kept lean on purpose: only the columns of the pax table live here.
 * The full cardex of a guest is shown in the "Información cliente" tabs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestData {
    @Label("Apellidos") String lastName;
    @Label("Nombre") String firstName;
    @Label("Pax") PaxType paxType;
    @Label("Régimen") MealPlan mealPlan;
    @Label("Nac.") String nationality;
    @Label("Estado habitación") RoomState roomState;
    @Label("Cardex") boolean hasCardex;
    @Label("Int.") boolean internal;
    @Label("Aviso") boolean aviso;
    @Label("Observaciones hotel") String hotelObservations;
}
