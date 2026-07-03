package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Status;
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
    // "auto" → each column sizes to its content (header + value) so nothing truncates, in both the
    // compact (v1/v3) and non-compact (v2) renderings.
    @ColumnWidth("auto") @Label("Pax") PaxType paxType;
    @ColumnWidth("auto") @Label("Edad") Integer age;
    @ColumnWidth("auto") @Label("Rég.") MealPlan mealPlan;
    @ColumnWidth("auto") @Label("Nac.") String nationality;
    @ColumnWidth("auto") @Label("Est.") Status status;
    @ColumnWidth("auto") @Label("Card.") boolean hasCardex;
    @ColumnWidth("auto") @Label("Int.") boolean internal;
    @ColumnWidth("auto") @Label("Aviso") boolean aviso;
    // No @ColumnWidth → this column flex-grows to fill the remaining space.
    @Label("Obs. hotel") String hotelObservations;

    // Full per-pax cardex; kept out of the grid columns but travels in the row data so the
    // selected guest carries it to the cardex component.
    @HiddenInList Cardex cardex;
}
