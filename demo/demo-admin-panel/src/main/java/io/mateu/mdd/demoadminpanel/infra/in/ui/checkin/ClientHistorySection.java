package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;

import java.util.ArrayList;
import java.util.List;

/** "Histórico cliente" section for {@link CheckInFormV2} (formerly a tab of ClientInfoSection). */
@PlainText
public class ClientHistorySection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<HistoryStay> historyStays = new ArrayList<>();

    void populate(ReservationLine line) {
        historyStays = new ArrayList<>(line.getHistoryStays());
    }
}
