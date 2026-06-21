package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.ColumnWidth;
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
    @ColumnWidth("9rem") @Label("Apellidos") String lastName;
    @ColumnWidth("7rem") @Label("Nombre") String firstName;
    @ColumnWidth("4rem") @Label("Pax") PaxType paxType;
    @ColumnWidth("5.5rem") @Label("Régimen") MealPlan mealPlan;
    @ColumnWidth("4rem") @Label("Nac.") String nationality;
    @ColumnWidth("9rem") @Label("Estado habitación") RoomState roomState;
    @ColumnWidth("5rem") @Label("Cardex") boolean hasCardex;
    @ColumnWidth("4rem") @Label("Int.") boolean internal;
    @ColumnWidth("4rem") @Label("Aviso") boolean aviso;
    // No @ColumnWidth → this column flex-grows to fill the remaining space.
    @Label("Obs. hotel") String hotelObservations;
}
