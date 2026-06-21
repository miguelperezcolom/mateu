package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;

import java.util.ArrayList;
import java.util.List;

@PlainText
@Compact
public class ImportesSection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<ImporteLine> importes = new ArrayList<>();

    void populate(ReservationLine line) {
        importes = new ArrayList<>(line.getImportes());
    }
}
