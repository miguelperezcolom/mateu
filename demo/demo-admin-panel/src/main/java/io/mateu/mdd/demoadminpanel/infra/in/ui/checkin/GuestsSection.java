package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.List;

@PlainText
@Compact
public class GuestsSection {

    @Label("")
    @Stereotype(FieldStereotype.grid)
    List<GuestData> guests = new ArrayList<>();

    void populate(ReservationLine line) {
        guests = new ArrayList<>(line.getGuests());
    }

    void applyTo(ReservationLine line) {
        line.setGuests(guests);
    }

    @Toolbar
    @Label("Tarjeta welcome")
    Object tarjetaWelcome(HttpRequest httpRequest) {
        return Message.success("Tarjeta welcome enviada a impresión");
    }

    @Button
    @Label("Código WiFi")
    Object codigoWifi(HttpRequest httpRequest) {
        return Message.success("Código WiFi: RIU-GUEST");
    }
}
