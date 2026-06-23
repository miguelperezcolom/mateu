package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@PlainText
@Compact
@Emits(events = {"checkin-confirmed", "pax-selected"}, name = "guests-section")
public class GuestsSection {

    @Hidden String id;

    @Label("")
    @Stereotype(FieldStereotype.grid)
    @OnRowSelected("onGuestSelected")
    List<GuestData> guests = new ArrayList<>();

    void populate(ReservationLine line) {
        id = line.getId();
        guests = new ArrayList<>(line.getGuests());
    }

    void applyTo(ReservationLine line) {
        line.setGuests(guests);
    }

    /**
     * Fired when the user selects a guest row. The clicked {@link GuestData} is auto-injected.
     * Announces it on the bus so the cardex (handled by the parent {@code CheckInForm}) updates.
     */
    Object onGuestSelected(GuestData guest, HttpRequest httpRequest) {
        if (guest == null) {
            return null;
        }
        var pax = new HashMap<String, Object>();
        pax.put("lastName", guest.getLastName());
        pax.put("firstName", guest.getFirstName());
        pax.put("paxType", guest.getPaxType() != null ? guest.getPaxType().name() : null);
        pax.put("mealPlan", guest.getMealPlan() != null ? guest.getMealPlan().name() : null);
        pax.put("nationality", guest.getNationality());
        pax.put("roomState", guest.getRoomState() != null ? guest.getRoomState().name() : null);
        pax.put("hasCardex", guest.isHasCardex());
        pax.put("hotelObservations", guest.getHotelObservations());
        // Wrapped in a List so the bare UICommand isn't treated as a page result.
        return List.of(UICommand.dispatchEvent("pax-selected", pax));
    }

    @Toolbar
    @Label("Confirmar check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.CHECKED_IN);
            repository.save(line);
            // Emit an event instead of navigating away: the page (and any other component
            // subscribed to "checkin-confirmed") refreshes itself in place via the event bus.
            return (Object) List.of(
                    Message.success("Check-in confirmado para " + line.getTitular()),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id))
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Toolbar
    @Label("No show")
    Object noShow(HttpRequest httpRequest) {
        return Message.success("Reserva marcada como No show");
    }

    @Toolbar
    @Label("Lector documento")
    Object lectorDocumento(HttpRequest httpRequest) {
        return Message.success("Lector de documento iniciado");
    }

    @Toolbar
    @Label("Tarjeta welcome")
    Object tarjetaWelcome(HttpRequest httpRequest) {
        return Message.success("Tarjeta welcome enviada a impresión");
    }

    @Toolbar
    @Label("Deshacer check-in")
    Object deshacerCheckin(HttpRequest httpRequest) {
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.PENDING);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Check-in deshecho"),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id))
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Toolbar
    @Label("Código WiFi")
    Object codigoWifi(HttpRequest httpRequest) {
        return Message.success("Código WiFi: RIU-GUEST");
    }

}
