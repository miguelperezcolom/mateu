package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.PlainText;

@PlainText
@Compact
public class RoomInfoSection {

    @Label("Nº habitación")             String roomInfoNumber;
    @Label("Dobles / Individuales")     String beds;
    @Label("Estado")                    RoomState roomState;
    @Label("Checkout")                  boolean checkout;
    @Colspan(2) @Label("Observaciones") String roomObservations;
    @Colspan(2) @Multiline @Label("Averías") String averias;

    void populate(ReservationLine line) {
        roomInfoNumber   = line.getAssignedRoom() == null || line.getAssignedRoom().isBlank()
                ? "—" : line.getAssignedRoom();
        beds             = line.getBeds();
        roomState        = line.getRoomState();
        checkout         = line.isCheckout();
        roomObservations = line.getRoomObservations();
        averias          = line.getAverias();
    }

    void applyTo(ReservationLine line) {
        line.setCheckout(checkout);
        line.setAverias(averias);
    }
}
