package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.masterdetail.NoSelection;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

/**
 * Check-in v2 — master-detail with a <b>horizontal</b> layout and an <b>empty</b> detail pane until
 * the user picks a part ({@link NoSelection#EMPTY}). All fields/data/header live in
 * {@link CheckInScreen}; this class only sets the route, layout and no-selection behaviour.
 */
@Service
@Scope("prototype")
@Route(value = "/checkin/:id/v2", parentRoute = "")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
    @Zone(name = "master", width = "60%"),
    @Zone(name = "detail", width = "40%")
})
public class CheckInFormV2 extends CheckInScreen {

  public CheckInFormV2(ReservationLineRepository repository) {
    super(repository);
  }

  @Override
  protected NoSelection noSelection() {
    return NoSelection.EMPTY;
  }
}
