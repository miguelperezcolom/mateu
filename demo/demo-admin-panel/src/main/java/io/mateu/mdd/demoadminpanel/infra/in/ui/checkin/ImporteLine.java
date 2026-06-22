package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** One pricing line shown in the "Importes" grid. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImporteLine {
    @Label("Tipo habitación") String roomType;
    @Label("Precio estancia") BigDecimal stayPrice;
    @Label("Moneda") String currency;
    @Label("P/H") String perPaxOrRoom;
}
