package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.State;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.ArrayList;
import java.util.List;

/**
 * Detail pane of the master-detail check-in screen (v3): an embedded read-only mediator that shows
 * ONE secondary part at a time. Mirrors {@link CardexView}: the loaded entity ({@link PartModel})
 * carries {@code @SubscribeTo("part-selected")}, so when the master's button bar emits that event
 * the {@code reloadPart} action runs on this component and reloads it in place with the chosen part
 * — without reloading the rest of the screen.
 *
 * <p>The selected part + reservation are kept in static holders (demo simplification, mirroring
 * {@code CardexView}) so the in-place re-renders that follow the action stay sticky.
 */
@UI("/checkin-part")
@ReadOnly
public class PartView extends AutoEditableView<PartModel> {

    static volatile String reservationId;
    static volatile String partId = "cliente";
    private static volatile boolean flip;

    /** Seed the detail for a reservation + part (called by the master on load). */
    public static void prime(String reservationId, String partId) {
        PartView.reservationId = reservationId;
        if (partId != null && !partId.isBlank()) {
            PartView.partId = partId;
        }
    }

    @Override
    public PartModel load(HttpRequest httpRequest) {
        var model = new PartModel();
        if (reservationId != null) {
            MateuBeanProvider.getBean(ReservationLineRepository.class)
                    .findById(reservationId)
                    .ifPresent(line -> {
                        model.populate(line);
                        if (!line.getGuests().isEmpty()) {
                            CardexView.prime(line.getGuests().get(0).getCardex());
                        }
                    });
        }
        return model;
    }

    @Override
    public void persist(PartModel entity, HttpRequest httpRequest) {
        // read-only
    }

    // Advertise "reloadPart" so this embedded component claims it (and routes it to handleAction)
    // when the part-selected subscription fires.
    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        var list = new ArrayList<>(super.actions(httpRequest));
        list.add(Action.builder().id("reloadPart").build());
        return list;
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("reloadPart".equals(actionId)) {
            var params = httpRequest.runActionRq().parameters();
            if (params != null && params.get("partId") != null) {
                partId = params.get("partId").toString();
            }
            // Alternate the (always-view) route so the embedded mediator sees a route change and
            // re-renders every time — re-resolving the view → load() with the new partId.
            flip = !flip;
            setRouteTo(flip ? "/view" : "/");
            return new State(this);
        }
        return super.handleAction(actionId, httpRequest);
    }
}
