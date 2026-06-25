package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getView;

import io.mateu.core.infra.declarative.orchestrators.MultiView;
import io.mateu.core.infra.declarative.orchestrators.OrchestrationResult;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * PROTOTYPE of a master-detail orchestrator. The master (left zone) shows the primary content and a
 * button bar; the detail (right zone) shows the selected secondary part. Built on {@link MultiView}:
 * the orchestrator IS its own model-view, so the parts' own actions route back to it; non-selected
 * parts are hidden via {@link VisibilitySupplier}. Once validated, the reusable base will move to core.
 */
@Service
@Scope("prototype")
@Route(value = "/:id/v3", uis = {"/checkin"})
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
    @Zone(name = "master", width = "60%"),
    @Zone(name = "detail", width = "40%")
})
public class CheckInFormV3 extends MultiView implements VisibilitySupplier {

    final ReservationLineRepository repository;

    public CheckInFormV3(ReservationLineRepository repository) {
        this.repository = repository;
    }

    @Hidden String id;
    @Hidden String partId = "cliente";

    // ── Master zone (always visible) ──────────────────────────────────
    @Section(value = "Información general de la reserva", columns = 8, zone = "master")
    @Label("") @Inline ReservacionInfoSection resvInfo = new ReservacionInfoSection();

    @Section(value = "Check-in", columns = 6, zone = "master")
    @Label("") @Inline CheckInSection checkIn = new CheckInSection();

    @Section(value = "Huéspedes", columns = 1, zone = "master")
    @Label("") @Inline GuestsSection guestList = new GuestsSection();

    // ── Detail zone (only the selected part is shown) ─────────────────
    @Section(value = "Información cliente", columns = 8, zone = "detail")
    @Label("") @Inline ClientInfoSection clientInfo = new ClientInfoSection();

    @Section(value = "Importes", columns = 1, zone = "detail")
    @Label("") @Inline ImportesSection importesList = new ImportesSection();

    @Section(value = "Información habitación", columns = 4, zone = "detail")
    @Label("") @Inline RoomInfoSection roomInfo = new RoomInfoSection();

    @Section(value = "Historial cliente", columns = 4, zone = "detail")
    @Label("") @Inline HistorialClienteSection historial = new HistorialClienteSection();

    @Section(value = "Folios / Anticipos", columns = 4, zone = "detail")
    @Label("") @Inline FoliosSection folios = new FoliosSection();

    /** Maps a part id (button) to the orchestrator field name holding that part. */
    private static final Map<String, String> PART_FIELD = Map.of(
            "cliente", "clientInfo",
            "importes", "importesList",
            "habitacion", "roomInfo",
            "historial", "historial",
            "folios", "folios");

    @Override
    public boolean isHidden(String member, HttpRequest httpRequest) {
        if (member.startsWith("_") || member.equals("repository")
                || member.equals("id") || member.equals("partId")) {
            return true;
        }
        if (PART_FIELD.containsValue(member)) {
            return !member.equals(PART_FIELD.get(partId));
        }
        return false;
    }

    @Override
    protected OrchestrationResult resolveInternalRoute(String route, HttpRequest httpRequest) {
        var idFromR = idFromRoute(route);
        if (idFromR != null) id = idFromR;
        partId = partFromRoute(route);
        if (id == null) {
            return new OrchestrationResult(route, this, PageView.builder().title("Check-in").build());
        }
        populate(httpRequest);
        var content = new ArrayList<Component>(getView(
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest,
                true,
                false));
        List<UserTrigger> bar = List.of(
                btn("Cliente", "cliente"), btn("Importes", "importes"),
                btn("Habitación", "habitacion"), btn("Historial", "historial"),
                btn("Folios", "folios"));
        var page = PageView.builder().title("Check-in").content(content).toolbar(bar).build();
        return new OrchestrationResult(route, this, page);
    }

    private static Button btn(String label, String id) {
        return new Button(label, "md:" + id);
    }

    @Override
    public boolean supportsAction(String actionId) {
        return actionId != null && actionId.startsWith("md:");
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId != null && actionId.startsWith("md:")) {
            var rid = idFromRoute(httpRequest.runActionRq().route());
            partId = actionId.substring(3);
            setRouteTo("/" + rid + "/part/" + partId);
            return List.of(
                    new State(this),
                    io.mateu.uidl.data.UICommand.pushStateToHistory("/checkin/" + rid + "/part/" + partId));
        }
        return null;
    }

    private static String idFromRoute(String route) {
        if (route == null) return null;
        var segs = route.replaceFirst("^/", "").split("/");
        return segs.length > 0 && !segs[0].isBlank() ? segs[0] : null;
    }

    private static String partFromRoute(String route) {
        if (route != null && route.contains("/part/")) {
            return route.substring(route.indexOf("/part/") + 6);
        }
        return "cliente";
    }

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        var list = new ArrayList<Action>();
        for (var key : PART_FIELD.keySet()) {
            list.add(Action.builder().id("md:" + key).build());
        }
        return list;
    }

    public boolean populate(HttpRequest httpRequest) {
        var found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }
        var line = found.get();
        resvInfo.populate(line);
        checkIn.populate(line);
        guestList.populate(line);
        clientInfo.populate(line);
        importesList.populate(line);
        roomInfo.populate(line);
        historial.populate(line);
        folios.populate(line);
        if (!line.getGuests().isEmpty()) {
            CardexView.prime(line.getGuests().get(0).getCardex());
        }
        return true;
    }
}
