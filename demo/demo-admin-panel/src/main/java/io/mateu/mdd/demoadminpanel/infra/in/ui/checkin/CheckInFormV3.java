package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.List;

/**
 * Master-detail check-in screen (v3). The master zone shows the primary content (reservation,
 * check-in, guests) plus a button bar; the detail zone shows ONE secondary part at a time.
 *
 * <p>Unlike a top-level orchestrator (which does not re-resolve on a {@code State} change), the detail
 * is an <b>embedded mediator</b> ({@link PartView}) driven by events: the {@link PartSelectorSection}
 * buttons emit "part-selected" and {@code PartView} reloads itself in place — the proven CardexView
 * pattern. So this screen is a plain declarative form; the master-detail behaviour comes entirely
 * from the embedded mediator + event bus.
 */
@Service
@Scope("prototype")
@Route(value = "/:id/v3", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
@SubscribeTo(event = "checkin-confirmed", action = "load", source = SubscriptionSource.DOCUMENT)
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
    @Zone(name = "master", width = "60%"),
    @Zone(name = "detail", width = "40%")
})
public class CheckInFormV3 implements HeaderSupplier, ActionSupplier {

    final ReservationLineRepository repository;

    public CheckInFormV3(ReservationLineRepository repository) {
        this.repository = repository;
    }

    // ── Hidden state (used only in header()) ──────────────────────────
    @Hidden String id;
    @Hidden String currency;
    @Hidden String localizador;
    @Hidden String agencia;
    @Hidden String hotel;
    @Hidden MealPlan mealPlan;
    @Hidden String chargeType;
    @Hidden LocalDate arrivalDate;
    @Hidden int nights;
    @Hidden LocalDate departureDate;
    @Hidden int adults;
    @Hidden int children;
    @Hidden int babies;
    @Hidden String reservationStatus;

    // ── Page-header badges ────────────────────────────────────────────
    @BadgeInHeader(label = "Garantizada", color = "success") boolean garantizada = true;
    @BadgeInHeader(label = "Terceros") boolean terceros;
    @BadgeInHeader(label = "Pdte. Int.") boolean pdteInt;
    @BadgeInHeader(label = "Exp.") boolean exp = true;
    @BadgeInHeader(label = "Múltiple") boolean multiple;
    @BadgeInHeader(label = "VIP", color = "contrast") boolean vip = true;

    // ── Master zone (always visible) ──────────────────────────────────
    @Section(value = "Información general de la reserva", columns = 8, zone = "master")
    @Label("") @Inline ReservacionInfoSection resvInfo = new ReservacionInfoSection();

    @Section(value = "Check-in", columns = 6, zone = "master")
    @Label("") @Inline CheckInSection checkIn = new CheckInSection();

    @Section(value = "Huéspedes", columns = 1, zone = "master")
    @Label("") @Inline GuestsSection guestList = new GuestsSection();

    // ── Detail zone: button bar + embedded mediator showing one part ──
    @Section(value = "Detalle", columns = 1, zone = "detail")
    @Label("") @Inline PartSelectorSection partSelector = new PartSelectorSection();

    @Section(value = "", columns = 1, zone = "detail")
    @Label("") @Inline PartView detail = new PartView();

    // ── Actions ───────────────────────────────────────────────────────

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        return List.of(Action.builder().id("load").build());
    }

    Object load(HttpRequest httpRequest) {
        if (id == null || id.isBlank()) {
            id = CheckInForm.idFromRoute(httpRequest);
        }
        return populate() ? (Object) new State(this) : Message.success("Reservation not found");
    }

    boolean populate() {
        var found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }
        var line = found.get();
        localizador       = line.getLocalizador();
        currency          = line.getCurrency();
        agencia           = line.getAgencia();
        hotel             = line.getHotel();
        mealPlan          = line.getMealPlan();
        chargeType        = line.getChargeType();
        arrivalDate       = line.getArrivalDate();
        departureDate     = line.getDepartureDate();
        nights            = (int) ChronoUnit.DAYS.between(line.getArrivalDate(), line.getDepartureDate());
        adults            = line.getAdults();
        children          = line.getChildren();
        babies            = line.getBabies();
        reservationStatus = line.getStatus() != null ? line.getStatus().name() : "";

        garantizada = line.isGarantizada();
        terceros    = line.isTerceros();
        pdteInt     = line.isPdteInt();
        exp         = line.isExp();
        multiple    = line.isMultiple();
        vip         = line.isVip();

        resvInfo.populate(line);
        checkIn.populate(line);
        guestList.populate(line);

        // Seed the embedded detail mediator (and cardex) so it shows data on first render.
        PartView.prime(id, "cliente");
        if (!line.getGuests().isEmpty()) {
            CardexView.prime(line.getGuests().get(0).getCardex());
        }
        return true;
    }

    // ── Context strip ─────────────────────────────────────────────────

    @Override
    public Collection<Component> header() {
        var info = HorizontalLayout.builder()
                .spacing(true)
                .style("flex-wrap: wrap; align-items: baseline; gap: 2px 1.75rem; width: 100%;")
                .content(List.of(
                        item("Localizador", localizador),
                        item("Hotel", hotel),
                        item("Agencia", agencia),
                        item("Estado", reservationStatus),
                        item("Estancia", arrivalDate + " → " + departureDate + " · " + nights + "N"),
                        item("Ocupación", adults + " AD · " + children + " CH · " + babies + " BB"),
                        item("Régimen", mealPlan != null ? mealPlan.name() : "—"),
                        item("Tipo cobro", chargeType)))
                .build();
        return List.of(VerticalLayout.builder().spacing(true).style("width: 100%;")
                .content(List.of(info)).build());
    }

    private static Component item(String label, String value) {
        return VerticalLayout.builder()
                .spacing(false).padding(false)
                .style("min-width: 0; line-height: 1.15;")
                .content(List.of(
                        Text.builder().text(label).container(TextContainer.div)
                                .style("font-size: 10px; text-transform: uppercase; letter-spacing: .3px;"
                                        + " color: var(--lumo-secondary-text-color);").build(),
                        Text.builder().text(nz(value)).container(TextContainer.div)
                                .style("font-size: 13px; font-weight: 600;").build()))
                .build();
    }

    private static String nz(String s) {
        return s == null || s.isBlank() ? "—" : s;
    }
}
