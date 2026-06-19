package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** One past stay shown in the client "Histórico" grid. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryStay {
    @Label("Fecha") String date;
    @Label("Hotel") String hotel;
    @Label("Noches") int nights;
    @Label("Régimen") String regime;
    @Label("Habitación") String room;
    @Label("Importe") BigDecimal amount;
}
