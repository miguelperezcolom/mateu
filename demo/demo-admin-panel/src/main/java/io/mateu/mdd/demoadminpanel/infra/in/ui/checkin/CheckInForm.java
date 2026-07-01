package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Check-in v1 — master-detail with a <b>vertical</b> (stacked) layout: no {@code @Zones}, so the
 * master sections and the selected detail part stack top-to-bottom. All fields/data/header live in
 * {@link CheckInScreen}; this class only sets the route and layout.
 */
@Service
@Scope("prototype")
@Route(value = "/checkin/:id", parentRoute = "")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
        @Zone(name = "left", width = "64%"),
        @Zone(name = "right", width = "36%")
})
public class CheckInForm extends CompactCheckInScreen implements TriggersSupplier, Hydratable {

  public CheckInForm(ReservationLineRepository repository) {
    super(repository);
  }


    @Override
    public List<Trigger> triggers(HttpRequest httpRequest) {
        return List.of(OnLoadTrigger.builder()
                .actionId("load")
                .build());
    }

    @Override
    public void hydrate(HttpRequest httpRequest) {
        load(httpRequest);
    }
}
