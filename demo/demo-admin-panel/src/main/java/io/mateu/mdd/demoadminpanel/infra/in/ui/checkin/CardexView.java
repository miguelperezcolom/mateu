package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/**
 * The cardex as an independent, embedded read-only component.
 *
 * <p>Embedded in {@link CheckInForm} as a {@code ServerSideComponent} (because it is a {@code
 * MultiView}). The {@link Cardex} it shows carries {@code @SubscribeTo("pax-selected")}, so when a
 * guest row is selected the {@code reloadPax} action runs <strong>on this component only</strong>,
 * re-rendering the cardex with the selected pax — without reloading the rest of the check-in form.
 *
 * <p>The selected cardex is kept in a static holder (demo simplification, mirroring {@code
 * PersonalDataView}) so that the in-place re-renders that follow the action stay sticky.
 */
@UI("/checkin-cardex")
@ReadOnly
public class CardexView extends AutoEditableView<Cardex> {

    private static volatile Cardex selected;
    private static volatile boolean flip;

    /** Seed the cardex with a pax (e.g. the lead guest) so it shows data on first render. */
    public static void prime(Cardex cardex) {
        selected = cardex;
    }

    @Override
    public Cardex load(HttpRequest httpRequest) {
        return selected != null
                ? selected
                : Cardex.builder().fullName("Seleccione un huésped").build();
    }

    @Override
    public void persist(Cardex entity, HttpRequest httpRequest) {
        selected = entity;
    }

    // Advertise the "reloadPax" action so the embedded component claims it (and routes it to
    // handleAction) when the pax-selected subscription fires.
    @Override
    public List<Action> actions(HttpRequest httpRequest) {
        var list = new ArrayList<>(super.actions(httpRequest));
        list.add(Action.builder().id("reloadPax").build());
        return list;
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("reloadPax".equals(actionId)) {
            var pax = httpRequest.getParameters(Cardex.class);
            if (pax != null) {
                selected = pax;
            }
            // Alternate the (always-view) route so the embedded mediator sees a route change and
            // re-renders its inner view every time — re-resolving the view → load() → selected pax.
            // (A fixed "/view" only re-renders on the first reload, since the state wouldn't change.)
            flip = !flip;
            setRouteTo(flip ? "/view" : "/");
            return new State(this);
        }
        return super.handleAction(actionId, httpRequest);
    }
}
