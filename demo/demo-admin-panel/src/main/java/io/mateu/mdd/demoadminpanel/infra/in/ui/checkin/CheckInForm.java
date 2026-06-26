package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
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
import io.mateu.uidl.di.MateuBeanProvider;
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

@Service
@Scope("prototype")
@Route(value = "/:id", uis = {"/checkin"})
@Trigger(type = TriggerType.OnLoad, actionId = "load")
// Refresh the whole form in place whenever any component announces a confirmed check-in,
// instead of forcing a navigation. Listens on the global event bus (document).
@SubscribeTo(event = "checkin-confirmed", action = "load", source = SubscriptionSource.DOCUMENT)
@ConfirmOnNavigationIfDirty
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
    @Zone(name = "left", width = "64%"),
    @Zone(name = "right", width = "36%")
})
public class CheckInForm implements HeaderSupplier, ActionSupplier {

    final ReservationLineRepository repository;

    public CheckInForm(ReservationLineRepository repository) {
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

    // ── Left-zone sections ────────────────────────────────────────────
    @Section(value = "Información general de la reserva", columns = 8, zone = "left")
    @Label("") @Inline
    ReservacionInfoSection resvInfo = new ReservacionInfoSection();

    @Section(value = "Check-in", columns = 6, zone = "left")
    @Label("") @Inline
    CheckInSection checkIn = new CheckInSection();

    @Section(value = "Huéspedes", columns = 1, zone = "left")
    @Label("") @Inline
    GuestsSection guestList = new GuestsSection();

    @Section(value = "Información cliente", columns = 8, zone = "left")
    @Label("") @Inline
    ClientInfoSection clientInfo = new ClientInfoSection();

    // ── Right-zone sections ───────────────────────────────────────────
    @Section(value = "Importes", columns = 1, zone = "right")
    @Label("") @Inline
    ImportesSection importesList = new ImportesSection();

    @Section(value = "Información habitación", columns = 4, zone = "right")
    @Label("") @Inline
    RoomInfoSection roomInfo = new RoomInfoSection();

    @Section(value = "Historial cliente", columns = 4, zone = "right")
    @Label("") @Inline
    HistorialClienteSection historial = new HistorialClienteSection();

    @Section(value = "Folios / Anticipos", columns = 4, zone = "right")
    @Label("") @Inline
    FoliosSection folios = new FoliosSection();

    // ── Actions ───────────────────────────────────────────────────────

    // Advertise the "load" action so the @SubscribeTo("checkin-confirmed") reload is claimed by
    // this component and dispatched to the server. Without it, the subscription-triggered action
    // bubbles up unclaimed (actions list would be null) and the form never refreshes in place.
    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        return List.of(Action.builder().id("load").build());
    }

    Object load(HttpRequest httpRequest) {
        if (id == null || id.isBlank()) {
            id = idFromRoute(httpRequest);
        }
        return populate() ? (Object) new State(this) : Message.success("Reservation not found");
    }

    /** The reservation id is the first route segment under the listing mount (e.g. /checkin/<id>). */
    static String idFromRoute(HttpRequest httpRequest) {
        var rq = httpRequest.runActionRq();
        if (rq == null || rq.route() == null) {
            return null;
        }
        var route = rq.route();
        var consumed = rq.consumedRoute() != null ? rq.consumedRoute() : "";
        var rel = route.startsWith(consumed) ? route.substring(consumed.length()) : route;
        var segs = rel.replaceFirst("^/", "").split("/");
        return segs.length > 0 && !segs[0].isBlank() ? segs[0] : null;
    }

    boolean populate() {
        var found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }
        var line = found.get();

        // Header hidden fields
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

        // Badges
        garantizada = line.isGarantizada();
        terceros    = line.isTerceros();
        pdteInt     = line.isPdteInt();
        exp         = line.isExp();
        multiple    = line.isMultiple();
        vip         = line.isVip();

        // Sections
        resvInfo.populate(line);
        checkIn.populate(line);
        guestList.populate(line);
        clientInfo.populate(line);
        importesList.populate(line);
        roomInfo.populate(line);
        historial.populate(line);
        folios.populate(line);

        // Seed the embedded cardex with the lead guest so it shows data on first render.
        if (!line.getGuests().isEmpty()) {
            CardexView.prime(line.getGuests().get(0).getCardex());
        }

        return true;
    }


    @Button
    @Label("Guardar")
    Object save(HttpRequest httpRequest) {
        return repository.findById(id).map(line -> {
            //repository.save(apply(line));
            return (Object) List.of(Message.success("Guardado"), UICommand.markAsClean());
        }).orElse(Message.success("Reservation not found"));
    }

    @Button
    @Label("Detalle")
    Object detalle(HttpRequest httpRequest) {
        return Message.success("Detalle");
    }

    @Button
    @Label("Editor")
    Object editor(HttpRequest httpRequest) {
        return Message.success("Editor");
    }
    @Button
    @Label("Estado Reserva")
    Object estado(HttpRequest httpRequest) {
        return Message.success("Estado");
    }
    @Button
    @Label("Prev. Cupo")
    Object prevCupo(HttpRequest httpRequest) {
        return Message.success("Perv. Cupo");
    }
    @Button
    @Label("Recibo T.")
    Object reciboT(HttpRequest httpRequest) {
        return Message.success("Recibo T.");
    }
    @Button
    @Label("Huéspedes")
    Object huespedes(HttpRequest httpRequest) {
        return Message.success("Huéspedes");
    }
    @Button
    @Label("Envío conf. reserva")
    Object envioConfReserva(HttpRequest httpRequest) {
        return Message.success("Envío conf. reserva");
    }
    @Button
    @Label("Auditoría Res.")
    Object autitoriaRes(HttpRequest httpRequest) {
        return Message.success("Auditoria Res.");
    }

    // ── Context strip shown above the two columns ─────────────────────

    @Override
    public Collection<Component> header() {
        // header() is extracted as part of the page structure, before the OnLoad load() runs — so
        // populate eagerly here (the :id route param is already bound) to avoid a header baked with
        // null values. populate() is idempotent for this purpose; load() still re-runs it on reload.
        if (id != null && localizador == null) {
            populate();
        }
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
                        item("Tipo cobro", chargeType),
                        item("Saldo", (folios.saldoPendiente != null
                                ? folios.saldoPendiente.toPlainString() : "0")
                                + " " + nz(currency))))
                .build();

        return List.of(
                VerticalLayout.builder()
                        .spacing(true)
                        .style("width: 100%;")
                        .content(List.of(info))
                        .build());
    }

    static Component item(String label, String value) {
        return VerticalLayout.builder()
                .spacing(false)
                .padding(false)
                .style("min-width: 0; line-height: 1.15;")
                .content(List.of(
                        Text.builder().text(label).container(TextContainer.div)
                                .style("font-size: 10px; text-transform: uppercase; letter-spacing: .3px;"
                                        + " color: var(--lumo-secondary-text-color);")
                                .build(),
                        Text.builder().text(nz(value)).container(TextContainer.div)
                                .style("font-size: 13px; font-weight: 600;")
                                .build()))
                .build();
    }

    static String nz(String s) {
        return s == null || s.isBlank() ? "—" : s;
    }
}
