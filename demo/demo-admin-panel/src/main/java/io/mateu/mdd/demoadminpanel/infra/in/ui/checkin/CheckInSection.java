package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@PlainText
@Compact
@Emits(events = "checkin-confirmed", name = "check-in-section")
public class CheckInSection {

    @Hidden String id;

    @Label("Nº habitación")             String assignedRoom;
    @Label("Tipo hab. física")          String roomTypePhysical;
    @Label("Tipo hab. contratada")      String roomType;
    @Label("Upgrade")                   boolean upgrade;
    @Colspan(2) @Label("Espera")        boolean espera;
    @Colspan(2) @Multiline @Label("Deseos")                  String deseos;
    @Colspan(2) @Multiline @Label("Observaciones internas")  String observacionesInternas;
    @Colspan(2) @Multiline @Label("Avisos")                  String avisos;

    @Toolbar
    @Label("Check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            line.setStatus(CheckInStatus.CHECKED_IN);
            // Mark every pax as checked in (C badge).
            line.getGuests().forEach(g -> g.setStatus(PaxStatus.CHECKIN.toBadge()));
            repository.save(line);
            // Announce it on the bus: the whole form (and any subscriber) refreshes in place.
            return (Object) List.of(
                    Message.success("Check-in confirmado para " + line.getTitular()),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id))
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Toolbar
    @Label("Pre asignar")
    Object preAsignar(HttpRequest httpRequest) {
        return Dialog.builder()
                .headerTitle("Preasignar habitación")
                .width("640px")
                .height("460px")
                .closeButtonOnHeader(true)
                .content(MateuBeanProvider.getBean(AvailableRoomsDialog.class).load(id))
                .build();
    }

    @Toolbar
    @Label("En recepción")
    Object enRecepcion(HttpRequest httpRequest) {
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            // Mark every pax as "en recepción" and flag the reservation as waiting.
            line.getGuests().forEach(g -> g.setStatus(PaxStatus.RECEPCION.toBadge()));
            line.setEspera(true);
            repository.save(line);
            return (Object) List.of(
                    Message.success("Todos los pax en recepción"),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id))
            );
        }).orElse(Message.success("Reservation not found"));
    }



    void populate(ReservationLine line) {
        id                   = line.getId();
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
