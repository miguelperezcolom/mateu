package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;

@PlainText
@Compact
public class CheckInSection {

    @Label("Nº habitación")             String assignedRoom;
    @Label("Tipo hab. física")          String roomTypePhysical;
    @Label("Tipo hab. contratada")      String roomType;
    @Label("Upgrade")                   boolean upgrade;
    @Colspan(2) @Label("Espera")        boolean espera;
    @Colspan(2) @Multiline @Label("Deseos")                  String deseos;
    @Colspan(2) @Multiline @Label("Observaciones internas")  String observacionesInternas;
    @Colspan(2) @Multiline @Label("Avisos")                  String avisos;

    void populate(ReservationLine line) {
        assignedRoom         = line.getAssignedRoom();
        roomTypePhysical     = line.getRoomTypePhysical();
        roomType             = line.getRoomType();
        upgrade              = line.isUpgrade();
        espera               = line.isEspera();
        deseos               = line.getDeseos();
        observacionesInternas = line.getObservacionesInternas();
        avisos               = line.getAvisos();
    }

    void applyTo(ReservationLine line) {
        line.setAssignedRoom(assignedRoom);
        line.setUpgrade(upgrade);
        line.setEspera(espera);
        line.setDeseos(deseos);
        line.setObservacionesInternas(observacionesInternas);
        line.setAvisos(avisos);
    }
}
