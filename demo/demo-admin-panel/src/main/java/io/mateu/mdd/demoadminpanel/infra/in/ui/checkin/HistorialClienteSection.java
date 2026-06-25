package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;

@PlainText
@Compact
@io.mateu.uidl.annotations.Title("")
public class HistorialClienteSection {

    @Label("Tipo Riu Class")    String riuClassType;
    @Label("Último hotel")      String lastHotel;
    @Label("RPC")               boolean rpc;
    @Label("Repetido")          int repeated;
    @Label("Tipo cliente")      String clientType;
    @Label("Nº Attn H")        int attnH;
    @Colspan(2) @Label("Última habitación") String lastRoom;
    @Colspan(4) @Multiline @Label("Preferencias") String historialPreferences;

    void populate(ReservationLine line) {
        riuClassType         = line.getRiuClassType();
        lastHotel            = line.getLastHotel();
        rpc                  = line.isRpc();
        repeated             = line.getRepeated();
        clientType           = line.getClientType();
        attnH                = line.getAttnH();
        lastRoom             = line.getLastRoom();
        historialPreferences = line.getPreferences();
    }
}
