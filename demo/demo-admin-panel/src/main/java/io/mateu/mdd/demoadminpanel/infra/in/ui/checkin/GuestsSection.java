package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
     * Emits the selected pax's full cardex on the bus; the embedded {@link CardexView} component
     * (which subscribes to "pax-selected") reloads only itself with it.
     */
    Object onGuestSelected(GuestData guest, HttpRequest httpRequest) {
        if (guest == null) {
            return null;
        }
        var cardex = guest.getCardex();
        if (cardex == null) {
            // Fallback for guests without a full cardex: derive a minimal one from the grid fields.
            cardex = Cardex.builder()
                    .fullName(join(", ", guest.getLastName(), guest.getFirstName()))
                    .natLang(guest.getNationality())
                    .provisionalCardex(!guest.isHasCardex())
                    .build();
        }
        // Wrapped in a List so the bare UICommand isn't treated as a page result.
        return List.of(UICommand.dispatchEvent("pax-selected", cardex));
    }

    private static String join(String sep, String... parts) {
        var sb = new StringBuilder();
        for (var p : parts) {
            if (p != null && !p.isBlank()) {
                if (sb.length() > 0) sb.append(sep);
                sb.append(p);
            }
        }
        return sb.toString();
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+c")
    @Label("Confirmar check-in")
    Object confirmCheckin(HttpRequest httpRequest) {
        return applyStatusToSelected(httpRequest, line -> PaxStatus.CHECKIN,
                "Check-in confirmado para los huéspedes seleccionados");
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+n")
    @Label("No show")
    Object noShow(HttpRequest httpRequest) {
        return applyStatusToSelected(httpRequest, line -> PaxStatus.NOSHOW,
                "Huéspedes seleccionados marcados como No show");
    }

    /**
     * Set the pax status of the <strong>selected</strong> guest rows. The selection rides in the
     * form state (guestList-guests_selected_items); guests are matched by name against the persisted
     * reservation. {@code statusFn} resolves the target status (it may depend on the reservation,
     * e.g. on the "espera" flag).
     */
    private Object applyStatusToSelected(HttpRequest httpRequest,
                                         java.util.function.Function<ReservationLine, PaxStatus> statusFn,
                                         String message) {
        var selectedKeys = httpRequest.getSelectedRows("guestList-guests", GuestData.class)
                .stream().map(CardexService::fullName).collect(Collectors.toSet());
        if (selectedKeys.isEmpty()) {
            return Message.builder().variant(NotificationVariant.warning)
                    .text("Seleccione al menos un huésped").build();
        }
        var repository = MateuBeanProvider.getBean(ReservationLineRepository.class);
        return repository.findById(id).map(line -> {
            var badge = statusFn.apply(line).toBadge();
            line.getGuests().stream()
                    .filter(g -> selectedKeys.contains(CardexService.fullName(g)))
                    .forEach(g -> g.setStatus(badge));
            repository.save(line);
            // Refresh the form (and any subscriber) in place via the event bus.
            return (Object) List.of(
                    Message.success(message),
                    UICommand.dispatchEvent("checkin-confirmed", Map.of("reservationId", id))
            );
        }).orElse(Message.success("Reservation not found"));
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+d")
    @Label("Lector documento")
    Object lectorDocumento(HttpRequest httpRequest) {
        return Message.success("Lector de documento iniciado");
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+w")
    @Label("Tarjeta welcome")
    Object tarjetaWelcome(HttpRequest httpRequest) {
        return Message.success("Tarjeta welcome enviada a impresión");
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+u")
    @Label("Deshacer check-in")
    Object deshacerCheckin(HttpRequest httpRequest) {
        // Back to "en recepción" if the reservation is waiting, otherwise to "pendiente".
        return applyStatusToSelected(httpRequest,
                line -> line.isEspera() ? PaxStatus.RECEPCION : PaxStatus.PENDIENTE,
                "Check-in deshecho para los huéspedes seleccionados");
    }

    @Toolbar
    @Action(shortcut = "ctrl+alt+f")
    @Label("Código WiFi")
    Object codigoWifi(HttpRequest httpRequest) {
        return Message.success("Código WiFi: RIU-GUEST");
    }

}
