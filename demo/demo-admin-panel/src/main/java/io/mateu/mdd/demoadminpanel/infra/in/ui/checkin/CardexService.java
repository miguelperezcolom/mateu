package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Cardex lookup + persistence. Stateless: the guest is identified by its full name ("Apellidos,
 * Nombre"), resolved from the form's current row selection — no fragile shared selection state.
 */
@Service
public class CardexService {

    private final ReservationLineRepository reservations;

    public CardexService(ReservationLineRepository reservations) {
        this.reservations = reservations;
    }

    /** The guest to edit: the selected row if any, otherwise the lead guest of the reservation. */
    public GuestData resolveGuest(String reservationId, GuestData selected) {
        if (selected != null) {
            return selected;
        }
        return reservations.findById(reservationId)
                .filter(l -> !l.getGuests().isEmpty())
                .map(l -> l.getGuests().get(0))
                .orElse(null);
    }

    /** Current cardex of the named guest (empty cardex if none yet). */
    public Cardex cardexOf(String reservationId, String guestFullName) {
        return findGuest(reservationId, guestFullName)
                .map(GuestData::getCardex)
                .orElse(Cardex.builder().build());
    }

    /** Use case: persist the edited cardex onto the named guest. */
    public void saveCardex(String reservationId, String guestFullName, Cardex edited) {
        reservations.findById(reservationId).ifPresent(line -> {
            findGuest(reservationId, guestFullName).ifPresent(g -> g.setCardex(edited));
            reservations.save(line);
        });
    }

    private Optional<GuestData> findGuest(String reservationId, String guestFullName) {
        if (reservationId == null || guestFullName == null) {
            return Optional.empty();
        }
        return reservations.findById(reservationId)
                .flatMap(l -> l.getGuests().stream()
                        .filter(g -> guestFullName.equals(fullName(g)))
                        .findFirst());
    }

    /** The guest identity used to match a cardex back to its pax: "Apellidos, Nombre". */
    static String fullName(GuestData g) {
        var last = g.getLastName() == null ? "" : g.getLastName();
        var first = g.getFirstName() == null ? "" : g.getFirstName();
        return (last + ", " + first).trim();
    }
}
