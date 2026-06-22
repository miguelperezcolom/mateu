package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;

@PlainText
@Compact
public class ReservacionInfoSection {

    @Label("Tiempo esperando") String waitingTime;
    @Label("Ref. tarifa")      String tarifaRef;
    @Label("Tipo tarifa")      String tarifaType;
    @Label("Grupo res.")       String grupoRes;
    @Label("Grupo op.")        String grupoOp;
    @Label("Riu Class")        String riuClass;
    @Label("Requiere")         String requiere;

    void populate(ReservationLine line) {
        waitingTime = line.getWaitingTime();
        tarifaRef   = line.getTarifaRef();
        tarifaType  = line.getTarifaType();
        grupoRes    = line.getGrupoRes();
        grupoOp     = line.getGrupoOp();
        riuClass    = line.getRiuClass();
        requiere    = line.getRequiere();
    }
}
