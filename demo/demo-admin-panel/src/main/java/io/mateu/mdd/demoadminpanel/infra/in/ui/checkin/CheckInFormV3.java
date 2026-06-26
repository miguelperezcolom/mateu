package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

/**
 * Check-in v3 — master-detail with a <b>horizontal</b> layout (master left, detail right) and the
 * first part pre-selected. All fields/data/header live in {@link CheckInScreen}; this class only
 * sets the route and layout.
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
public class CheckInFormV3 extends CheckInScreen {

  public CheckInFormV3(ReservationLineRepository repository) {
    super(repository);
  }
}
