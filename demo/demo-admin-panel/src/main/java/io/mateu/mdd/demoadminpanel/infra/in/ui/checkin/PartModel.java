package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;

import java.util.Map;

/**
 * Loaded entity (model-view) of the detail pane {@link PartView}. Holds all secondary parts but
 * shows only the selected one ({@link PartView#partId}); the others are hidden via
 * {@link VisibilitySupplier}.
 *
 * <p>Carries {@code @SubscribeTo("part-selected")} so that when the master's button bar emits the
 * event, {@code reloadPart} runs on the embedded {@link PartView}, which reloads itself in place
 * with the chosen part — the same mechanism the cardex uses for {@code pax-selected}. The
 * subscription MUST live on this entity (the model-view), not on the orchestrator, so the action is
 * initiated by the embedded mediator's own {@code <mateu-ux>} and its {@code State} re-navigates it.
 */
@ReadOnly
@PlainText
@Compact
@Title("")
@SubscribeTo(event = "part-selected", action = "reloadPart", source = SubscriptionSource.DOCUMENT)
public class PartModel implements VisibilitySupplier {

    @Section(value = "Información cliente", columns = 8) @Label("") @Inline
    ClientInfoSection clientInfo = new ClientInfoSection();

    @Section(value = "Importes", columns = 1) @Label("") @Inline
    ImportesSection importesList = new ImportesSection();

    @Section(value = "Información habitación", columns = 4) @Label("") @Inline
    RoomInfoSection roomInfo = new RoomInfoSection();

    @Section(value = "Historial cliente", columns = 4) @Label("") @Inline
    HistorialClienteSection historial = new HistorialClienteSection();

    @Section(value = "Folios / Anticipos", columns = 4) @Label("") @Inline
    FoliosSection folios = new FoliosSection();

    /** Button id (part key) → field name holding that part. */
    static final Map<String, String> PART_FIELD = Map.of(
            "cliente", "clientInfo",
            "importes", "importesList",
            "habitacion", "roomInfo",
            "historial", "historial",
            "folios", "folios");

    void populate(ReservationLine line) {
        clientInfo.populate(line);
        importesList.populate(line);
        roomInfo.populate(line);
        historial.populate(line);
        folios.populate(line);
    }

    @Override
    public boolean isHidden(String member, HttpRequest httpRequest) {
        if (PART_FIELD.containsValue(member)) {
            return !member.equals(PART_FIELD.get(PartView.partId));
        }
        return false;
    }
}
